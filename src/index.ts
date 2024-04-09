import { InputAction, Material, PointerEvents, pointerEventsSystem, PointerEventType } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { createCube } from './factory'
import { getUserAccount } from '~system/EthereumController'
import { ProposalsListUI } from './ui'
import { getSceneInfo } from '~system/Scene'
import { fetchProposals, vote } from './snapshot'

// Defining behavior. See `src/systems.ts` file.
// engine.addSystem(circularSystem)
// engine.addSystem(bounceScalingSystem)

const ui = new ProposalsListUI([])
const sceneCoords = getSceneInfo({})

export async function main() {
  console.log('coords')
  console.log(JSON.parse((await sceneCoords).metadata).scene.base)

  const proposals = await fetchProposals('snapshot.dcl.eth')
  ui.displayUi(proposals.slice(-1))

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
