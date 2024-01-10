// Fetch proposals from snapshot
export async function fetchProposals(space: string) {
  const res = await fetch('https://hub.snapshot.org/graphql', {
    headers: {
      accept: '*/*',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'Space',
      variables: {
        id: 'snapshot.dcl.eth'
      },
      query:
        'query Space($id: String!) {\n  space(id: $id) {\n    id\n    name\n    about\n    network\n    symbol\n    network\n    terms\n    skin\n    avatar\n    twitter\n    website\n    github\n    coingecko\n    private\n    domain\n    admins\n    moderators\n    members\n    categories\n    plugins\n    followersCount\n    template\n    guidelines\n    verified\n    flagged\n    parent {\n      id\n      name\n      avatar\n      followersCount\n      children {\n        id\n      }\n    }\n    children {\n      id\n      name\n      avatar\n      followersCount\n      parent {\n        id\n      }\n    }\n    voting {\n      delay\n      period\n      type\n      quorum\n      privacy\n      hideAbstain\n    }\n    strategies {\n      name\n      network\n      params\n    }\n    validation {\n      name\n      params\n    }\n    voteValidation {\n      name\n      params\n    }\n    filters {\n      minScore\n      onlyMembers\n    }\n    delegationPortal {\n      delegationType\n      delegationContract\n      delegationApi\n    }\n    treasuries {\n      name\n      address\n      network\n    }\n  }\n}'
    }),
    method: 'POST'
  })
  if (res.status !== 200) {
    throw new Error('Could not fetch proposals')
  }
  const { data } = await res.json()
  return data
}
