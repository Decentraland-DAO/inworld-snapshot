// Fetch proposals from snapshot
export async function fetchProposals(space: string, state: string = 'active') {
  /*   const res = await fetch('https://hub.snapshot.org/graphql', {
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
 */
  const res = await fetch('https://governance.decentraland.org/api/proposals?limit=25&offset=0&status=active')
  if (res.status !== 200) {
    console.log(res.status)

    throw new Error('Could not fetch proposals')
  }
  const data = await res.json()
  return data.data
}
