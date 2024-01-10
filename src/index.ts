import {
  engine,
  InputAction,
  Material,
  PointerEvents,
  pointerEventsSystem,
  PointerEventType,
  Transform
} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { createEthereumProvider } from '@dcl/sdk/ethereum-provider'
import { createCube } from './factory'
import { getDataToSign, snapshotERC712 } from './utils'
import { getUserAccount } from '~system/EthereumController'
import { ProposalsListUI, VotingUI } from './ui'
import { getSceneInfo } from '~system/Scene'
import { fetchProposals } from './snapshot'

// Defining behavior. See `src/systems.ts` file.
// engine.addSystem(circularSystem)
// engine.addSystem(bounceScalingSystem)
const provider = createEthereumProvider()

const ui = new ProposalsListUI([])
const sceneCoords = getSceneInfo({})

export async function main() {
  console.log('coords')
  console.log(JSON.parse((await sceneCoords).metadata).scene.base)

  const proposals = await fetchProposals('snapshot.dcl.eth')
  ui.displayUi(proposals)

  const address = await getUserAccount({})
  const yesCube = createCube(6.5, 1, 8, false)
  Material.setPbrMaterial(yesCube, { albedoColor: Color4.Green() })
  const noCube = createCube(8, 1, 8, false)
  Material.setPbrMaterial(noCube, { albedoColor: Color4.Red() })
  const abstainCube = createCube(9.5, 1, 8, false)
  Material.setPbrMaterial(abstainCube, { albedoColor: Color4.Gray() })
  const pointerEvent = {
    eventType: PointerEventType.PET_DOWN,
    eventInfo: {
      button: InputAction.IA_POINTER,
      hoverText: 'Click to vote',
      maxDistance: 100,
      showFeedback: true
    }
  }
  PointerEvents.create(yesCube, {
    pointerEvents: [{ ...pointerEvent, eventInfo: { ...pointerEvent.eventInfo, hoverText: 'Click to vote yes' } }]
  })
  PointerEvents.create(noCube, {
    pointerEvents: [{ ...pointerEvent, eventInfo: { ...pointerEvent.eventInfo, hoverText: 'Click to vote no' } }]
  })
  PointerEvents.create(abstainCube, {
    pointerEvents: [{ ...pointerEvent, eventInfo: { ...pointerEvent.eventInfo, hoverText: 'Click to abstain' } }]
  })
  const proposalOpts = {
    space: 'snapshot.dcl.eth',
    choice: 3,
    //proposal: "c96c3830-4d4c-11ee-beb5-696f9c967b67",
    //proposal: "0x3033c8bc06f4f6361c23fde8ed1d6e37d0aecd2a75de4f9581c9e3510b6cee96",
    proposal: '0xbea0f797e4cf14727195d27d72299d52c7b8a17ee8d189787d48a5968bb4757c',
    reason: '',
    app: 'in-world',
    metadata: JSON.stringify({
      survey: [],
      world: {
        coordinates: []
      }
    })
  }

  pointerEventsSystem.onPointerDown({ entity: yesCube, opts: { button: InputAction.IA_POINTER } }, () => {
    const choice = 1
    //ui.displayUi(choice === 1 ? 'yes' : choice === 2 ? 'no' : 'abstain')

    if (address.address) void vote(address.address, { ...proposalOpts, choice: 1 })
  })
  pointerEventsSystem.onPointerDown({ entity: noCube, opts: { button: InputAction.IA_POINTER } }, () => {
    if (address.address) void vote(address.address, { ...proposalOpts, choice: 2 })
  })
  pointerEventsSystem.onPointerDown({ entity: abstainCube, opts: { button: InputAction.IA_POINTER } }, () => {
    if (address.address) void vote(address.address, { ...proposalOpts, choice: 3 })
  })
}

// Get players coordinates
async function getCoordinates() {
  const sceneBase = JSON.parse((await sceneCoords).metadata).scene.base.split(',')
  const playerPosition = Transform.getOrNull(engine.PlayerEntity)

  if (playerPosition)
    return [
      +sceneBase[0] + Math.floor(playerPosition.position.x / 16),
      +sceneBase[1] + Math.floor(playerPosition.position.z / 16)
    ]
  return []
}

// function to vote
async function vote(
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

      const choice = snapshotOpts.choice
    }
  )
}

// function to fetch checksummed ethereum address
async function getChecksummedAddress(address: string) {
  const res = await fetch(`https://ethchecksumg0tdjsmm-checksum.functions.fnc.fr-par.scw.cloud/?eth=${address}`)
  if (res.status !== 200) {
    throw new Error('Could not fetch checksummed address')
  }
  return await res.text()
}
