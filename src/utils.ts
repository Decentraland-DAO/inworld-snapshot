import { engine, Transform } from '@dcl/sdk/ecs'
import { getSceneInfo } from '~system/Scene'
const sceneCoords = getSceneInfo({})

export function getRandomHexColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// Get players coordinates
export async function getCoordinates() {
  const sceneBase = JSON.parse((await sceneCoords).metadata).scene.base.split(',')
  const playerPosition = Transform.getOrNull(engine.PlayerEntity)

  if (playerPosition)
    return [
      +sceneBase[0] + Math.floor(playerPosition.position.x / 16),
      +sceneBase[1] + Math.floor(playerPosition.position.z / 16)
    ]
  return []
}

export function getAvatarURL(ethAddress: string) {
  return `https://cdn.stamp.fyi/avatar/eth:${ethAddress}?s=40`
}

export async function getDataToSign(message: {
  from: string
  space: string
  proposal: string
  choice: number
  reason: string
  app: string
  metadata: string
}): Promise<any> {
  const dataToSign = { ...snapshotERC712, message: { ...message, timestamp: Math.floor(Date.now() / 1000) } }
  return dataToSign
}

export const snapshotERC712 = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' }
    ],
    Vote: [
      {
        name: 'from',
        type: 'address'
      },
      {
        name: 'space',
        type: 'string'
      },
      {
        name: 'timestamp',
        type: 'uint64'
      },
      {
        name: 'proposal',
        type: 'bytes32'
      },
      {
        name: 'choice',
        type: 'uint32'
      },
      {
        name: 'reason',
        type: 'string'
      },
      {
        name: 'app',
        type: 'string'
      },
      {
        name: 'metadata',
        type: 'string'
      }
    ]
  },
  domain: {
    name: 'snapshot',
    version: '0.1.4'
  },
  primaryType: 'Vote',
  message: {}
}
