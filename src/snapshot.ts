import { createEthereumProvider } from '@dcl/sdk/ethereum-provider'
// import { Proposal, ProposalList } from './types'
import { getCoordinates, getDataToSign, snapshotERC712 } from './utils'
import { engine, Transform } from '@dcl/sdk/ecs'
const provider = createEthereumProvider()

export type Proposal = {
  id: string
  title: string
  space: { id: string }
  body: string
  choices: string[]
  scores: number[]
  scores_total: number
}
type ProposalList = Proposal[]

// Fetch proposals from snapshot
export async function fetchProposals(space: string, state: string = 'active'): Promise<ProposalList[]> {
  const res = await fetch('https://hub.snapshot.org/graphql', {
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'Proposals',
      variables: {
        first: 100,
        state,
        space_in: [space]
      },
      query: `query Proposals($first: Int!, $state: String!, $space_in: [String]) {
      proposals(
        first: $first
        where: {state: $state, space_in: $space_in}
      ) {
        id
        title
        start
        end
        state
        space {
          id
          name
          avatar
        }
      }
    }`
    }),

    method: 'POST'
  })
  if (res.status !== 200) {
    console.log(res.status)

    throw new Error('Could not fetch proposals')
  }
  const { data } = await res.json()
  return data.proposals
  /* 
  const res = await fetch('https://governance.decentraland.org/api/proposals?limit=25&offset=0&status=active')
  if (res.status !== 200) {
    console.log(res.status)

    throw new Error('Could not fetch proposals')
  }
  const data = await res.json()
  return data.data
  */
}

// Fetch single proposal from snapshot
export async function fetchProposal(proposalId: string): Promise<Proposal> {
  const res = await fetch('https://hub.snapshot.org/graphql', {
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'Proposal',
      variables: {
        id: proposalId
      },
      query:
        'query Proposal($id: String!) {\n  proposal(id: $id) {\n    id\n    ipfs\n    title\n    body\n    discussion\n    choices\n    start\n    end\n    snapshot\n    state\n    author\n    created\n    plugins\n    network\n    type\n    quorum\n    quorumType\n    symbol\n    privacy\n    validation {\n      name\n      params\n    }\n    strategies {\n      name\n      network\n      params\n    }\n    space {\n      id\n      name\n    }\n    scores_state\n    scores\n    scores_by_strategy\n    scores_total\n    votes\n    flagged\n  }\n}'
    }),

    method: 'POST'
  })
  if (res.status !== 200) {
    console.log(res.status)

    throw new Error('Could not fetch proposal')
  }
  const { data } = await res.json()
  return data.proposal
}

// Fetch votes from snapshot
export async function fetchVotes(proposalId: string): Promise<any> {
  const res = await fetch('https://hub.snapshot.org/graphql', {
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'Votes',
      variables: {
        id: proposalId,
        first: 100,
        skip: 0,
        orderBy: 'vp',
        orderDirection: 'desc'
      },
      query:
        'query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $reason_not: String, $voter: String, $space: String, $created_gte: Int) {\n  votes(\n    first: $first\n    skip: $skip\n    where: {proposal: $id, vp_gt: 0, voter: $voter, space: $space, reason_not: $reason_not, created_gte: $created_gte}\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    ipfs\n    voter\n    choice\n    vp\n    vp_by_strategy\n    reason\n    created\n  }\n}'
    }),

    method: 'POST'
  })
  if (res.status !== 200) {
    console.log(res.status)

    throw new Error('Could not fetch votes')
  }
  const { data } = await res.json()
  return data.votes
}

// function to vote
export async function vote(
  fromAddress: string,
  snapshotOpts: { space: string; choice: number; proposal: string; reason: string; app: string; metadata: string }
) {
  const address = await getChecksummedAddress(fromAddress)
  const playerPosition = Transform.getOrNull(engine.PlayerEntity)
  if (playerPosition)
    snapshotOpts.metadata = JSON.stringify({ survey: [], world: { coordinates: await getCoordinates() } })

  const dataToSign = await getDataToSign({
    from: address,
    ...snapshotOpts
  })
  provider.sendAsync(
    {
      method: 'eth_signTypedData_v4',
      params: [address, JSON.stringify(dataToSign)],
      jsonrpc: '2.0',
      id: 999999999999
    },
    async (err, result) => {
      if (err) {
        return console.error(err)
      }
      console.log(result)
      const snapshotRes = await fetch('https://seq.snapshot.org/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address,
          sig: result.result,
          data: {
            domain: snapshotERC712.domain,
            types: {
              Vote: snapshotERC712.types.Vote
            },
            message: dataToSign.message
          }
        })
      })
      if (snapshotRes.status !== 200) {
        throw new Error('Could not fetch snapshot')
      }
    }
  )
}

// function to fetch checksummed ethereum address
async function getChecksummedAddress(address: string) {
  const res = await fetch(`https://round-tooth-ac18.hp-230.workers.dev/${address}`)
  if (res.status !== 200) {
    throw new Error('Could not fetch checksummed address')
  }
  return await res.text()
}
