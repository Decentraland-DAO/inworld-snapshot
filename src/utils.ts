export function getRandomHexColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
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
