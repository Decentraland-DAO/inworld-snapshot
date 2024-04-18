import { engine, Transform } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity, UiComponent } from '@dcl/sdk/react-ecs'
import { openExternalUrl } from '~system/RestrictedActions'
import { getSceneInfo } from '~system/Scene'
import { fetchProposal, Proposal, vote } from './snapshot'

let selectedProposal: Proposal = {
  id: '',
  title: 'Decentraland DAO',
  space: { id: 'snapshot.dcl.eth' },
  body: 'Select a proposal from the right',
  choices: ['', '', ''],
  scores: [0, 0, 0],
  scores_total: 0
}

let propScroll = 0

const splitTextIntoSections = (text: string, charsPerLine: number, linesPerChunk: number) => {
  let lines = []
  let currentLine = ''

  text.split(' ').forEach((word) => {
    const splitWord = word.split('\n')

    splitWord.forEach((part, index) => {
      if (currentLine.length + part.length > charsPerLine || part === '') {
        lines.push(currentLine)
        currentLine = ''
      }

      if (currentLine.length > 0 && part !== '') {
        currentLine += ' '
      }

      currentLine += part

      if (index < splitWord.length - 1 || part === '') {
        lines.push(currentLine)
        currentLine = ''
      }
    })
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  let textSections = []
  for (let i = 0; i < lines.length; i += linesPerChunk) {
    textSections.push(lines.slice(i, i + linesPerChunk).join('\n'))
  }

  return textSections
}

let textSections = splitTextIntoSections(selectedProposal.body, 70, 50)

let currentPage = 0
const nextPage = () => {
  if (currentPage < textSections.length - 1) {
    currentPage++
  }
}
const prevPage = () => {
  if (currentPage > 0) {
    currentPage--
  }
}

// export class VotingUI {
//   display: boolean = false
//   vote: 'yes' | 'no' | 'abstain' = 'abstain'
//   constructor() {
//     ReactEcsRenderer.setUiRenderer(() => (
//       <UiEntity
//         uiTransform={{
//           width: 400,
//           height: 150,
//           margin: {
//             top: -150 / 2,
//             left: -400 / 2
//           },
//           padding: 4,
//           positionType: 'absolute',
//           position: { top: '50%', left: '50%' },
//           display: this.display ? 'flex' : 'none'
//         }}
//         uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
//       >
//         <UiEntity
//           uiTransform={{
//             width: '100%',
//             height: '100%',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'space-between'
//           }}
//           uiBackground={{ color: Color4.fromHexString('#70ac76ff') }}
//         >
//           <Label
//             uiTransform={{
//               width: '100%',
//               height: 50,
//               margin: '8px 0'
//             }}
//             value={`You successfully voted: ${this.vote.toUpperCase()}`}
//             fontSize={24}
//           />
//           <Label
//             uiTransform={{
//               width: '100%',
//               height: 50,
//               margin: '8px 0'
//             }}
//             value={`${getPlayerPosition()}`}
//             fontSize={24}
//           />
//           <Button
//             uiTransform={{ width: 100, height: 40, margin: 4 }}
//             value="Close"
//             variant="primary"
//             fontSize={18}
//             onMouseDown={() => {
//               this.display = false
//             }}
//           />
//           <Button
//             uiTransform={{ width: 150, height: 40, margin: 4 }}
//             value="Open proposal"
//             variant="primary"
//             fontSize={18}
//             onMouseDown={() => {
//               void openExternalUrl({
//                 url: 'https://governance.decentraland.org/proposal/?id=c96c3830-4d4c-11ee-beb5-696f9c967b67'
//               })
//             }}
//           />
//         </UiEntity>
//       </UiEntity>
//     ))
//   }
//   // display ui and set vote
//   displayUi(vote: 'yes' | 'no' | 'abstain') {
//     console.log('displayUi', vote)

//     this.vote = vote
//     this.display = true
//   }
// }

// function getPlayerPosition() {
//   const playerPosition = Transform.getOrNull(engine.PlayerEntity)
//   if (!playerPosition) return ' no data yet'
//   const { x, y, z } = playerPosition.position
//   return `{X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, z: ${z.toFixed(2)} }`
// }

export class ProposalsUI {
  display: boolean = false
  proposals: any[] = []
  address: string | undefined
  constructor() {
    ReactEcsRenderer.setUiRenderer(() => (
      <UiEntity
        uiTransform={{
          width: '88%',
          height: '80%',
          positionType: 'absolute',
          position: { bottom: '0%', right: '2%' },
          display: this.display ? 'flex' : 'none',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'flex-start'
        }}
      >
        <UiEntity
          uiTransform={{
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-start'
          }}
        >
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              margin: { bottom: 10, left: 10, right: 10, top: 24 }
            }}
          >
            <Button
              uiTransform={{ width: 320, height: 40 }}
              value="Previous Proposal"
              variant="secondary"
              fontSize={18}
              color={Color4.fromHexString('#FFFFFF')}
              onMouseDown={() => {
                propScroll = Math.max(0, propScroll - 1)
                // console.log(propScroll)
              }}
              uiBackground={{
                textureMode: 'stretch',
                texture: {
                  src: 'images/button.png'
                }
              }}
              disabled={propScroll === 0}
            />
          </UiEntity>
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {this.proposals &&
              this.proposals.slice(propScroll, propScroll + 5).map((proposal, index) => (
                <UiEntity
                  key={index}
                  uiTransform={{
                    width: '100%',
                    height: '100%',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 4
                  }}
                >
                  <Label
                    uiTransform={{
                      width: '320',
                      height: 77,
                      margin: { top: 0, bottom: 0 }
                    }}
                    uiBackground={{
                      textureMode: 'stretch',
                      texture: {
                        src: 'images/proposalTitle.png'
                      }
                    }}
                    value={`${proposal.title.length > 30 ? `${proposal.title.substring(0, 30)}...` : proposal.title}`}
                    fontSize={16}
                    color={Color4.fromHexString('#000000')}
                    onMouseDown={() => {
                      if (selectedProposal.id === proposal.id) return
                      fetchProposal(proposal.id).then((res) => {
                        // console.log(res)
                        selectedProposal = res
                        textSections = splitTextIntoSections(res.body, 70, 20)
                        currentPage = 0
                      })
                    }}
                  />
                </UiEntity>
              ))}
          </UiEntity>
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 200,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              margin: 10
            }}
          >
            <Button
              uiTransform={{ width: 320, height: 40 }}
              value="Next Proposal"
              variant="secondary"
              fontSize={18}
              color={Color4.fromHexString('#FFFFFF')}
              onMouseDown={() => {
                if (propScroll >= this.proposals.length - 5) return
                propScroll++
                // console.log(propScroll)
              }}
              uiBackground={{
                textureMode: 'stretch',
                texture: {
                  src: 'images/button.png'
                }
              }}
              disabled={propScroll >= this.proposals.length - 5}
            />
          </UiEntity>
        </UiEntity>
        <UiEntity
          uiTransform={{
            width: 'auto',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            margin: { left: 20 }
          }}
        >
          <Label
            uiTransform={{
              width: 650,
              height: 69
            }}
            uiBackground={{
              textureMode: 'stretch',
              texture: {
                src: 'images/selectedProposalTitle.png'
              }
            }}
            value={selectedProposal.title ? selectedProposal.title : 'Loading...'}
            fontSize={20}
            color={Color4.fromHexString('#ffffff')}
          />
          <UiEntity
            uiTransform={{
              width: 725,
              height: 409,
              margin: { top: 10 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            uiBackground={{
              textureMode: 'stretch',
              texture: {
                src: 'images/selectedProposalBody.png'
              }
            }}
          >
            <Label
              uiTransform={{
                padding: 10,
                height: 'auto'
              }}
              value={textSections[currentPage]}
              fontSize={14}
              textAlign="top-center"
              color={Color4.fromHexString('#000000')}
            />
          </UiEntity>
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 50,
              flexDirection: 'row',
              alignItems: 'space-between',
              justifyContent: 'space-between'
            }}
          >
            {selectedProposal.id && (
              <UiEntity
                uiTransform={{
                  width: '100%',
                  height: 50,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}
              >
                <Button
                  uiTransform={{ width: 120, height: 40, margin: 4 }}
                  value="Prev Page"
                  variant="secondary"
                  fontSize={18}
                  color={Color4.fromHexString('#FFFFFF')}
                  onMouseDown={() => {
                    prevPage()
                  }}
                  uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                      src: 'images/button.png'
                    }
                  }}
                />
                <Button
                  uiTransform={{ width: 120, height: 40, margin: 4 }}
                  value="Next Page"
                  variant="secondary"
                  fontSize={18}
                  color={Color4.fromHexString('#FFFFFF')}
                  onMouseDown={() => {
                    nextPage()
                  }}
                  uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                      src: 'images/button.png'
                    }
                  }}
                />
              </UiEntity>
            )}
            <UiEntity
              uiTransform={{
                width: '100%',
                height: 50,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              {selectedProposal.id && (
                <Button
                  uiTransform={{ width: 120, height: 40, margin: 4 }}
                  value="Open Link"
                  variant="secondary"
                  fontSize={18}
                  color={Color4.fromHexString('#FFFFFF')}
                  uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                      src: 'images/button.png'
                    }
                  }}
                  onMouseDown={() => {
                    void openExternalUrl({
                      url: `https://snapshot.org/#/snapshot.dcl.eth/proposal/${selectedProposal.id}`
                    })
                  }}
                />
              )}
              <Button
                uiTransform={{ width: 80, height: 40, margin: 4 }}
                value="Close"
                variant="secondary"
                fontSize={18}
                color={Color4.fromHexString('#FFFFFF')}
                onMouseDown={() => {
                  this.display = false
                }}
                uiBackground={{
                  textureMode: 'stretch',
                  texture: {
                    src: 'images/button.png'
                  }
                }}
              />
            </UiEntity>
          </UiEntity>
          <UiEntity
            uiTransform={{
              width: 'auto',
              height: 'auto',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {selectedProposal.choices &&
              selectedProposal.choices[0] !== '' &&
              selectedProposal.choices.map((choice, index) => (
                <Button
                  key={index}
                  uiTransform={{ width: 400, height: 40, margin: 4 }}
                  value={
                    choice.charAt(0).toUpperCase() + choice.slice(1) +
                    ' - ' +
                    ((selectedProposal.scores[index] / selectedProposal.scores_total) * 100).toFixed(2) +
                    '%'
                  }
                  variant="secondary"
                  color={Color4.fromHexString('#FFFFFF')}
                  fontSize={18}
                  onMouseDown={() => {
                    if (this.address) {
                      // console.log(this.address)
                      vote(this.address, {
                        space: 'snapshot.dcl.eth',
                        choice: index + 1,
                        proposal: selectedProposal.id,
                        reason: '',
                        app: 'in-world',
                        metadata: JSON.stringify({
                          survey: [],
                          world: {
                            coordinates: []
                          }
                        })
                      })
                    }
                  }}
                  uiBackground={{
                    textureMode: 'stretch',
                    texture: {
                      src: 'images/button.png'
                    }
                  }}
                />
              ))}
          </UiEntity>
        </UiEntity>
      </UiEntity>
    ))
  }
  displayUi(proposals: any[], address: string | undefined) {
    this.proposals = proposals
    this.address = address
    // console.log(proposals)
    // console.log(address, 'address log')

    this.display = true
  }
}

// export class ProposalsListUI {
//   display: boolean = false
//   proposals: any[] = []
//   constructor(proposals: any[]) {
//     ReactEcsRenderer.setUiRenderer(() => (
//       <UiEntity
//         uiTransform={{
//           width: '30%',
//           height: '80%',
//           padding: 4,
//           positionType: 'absolute',
//           position: { top: '10%', left: '40%' },
//           display: this.display ? 'flex' : 'none'
//         }}
//         uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
//       >
//         {this.proposals &&
//           this.proposals.map((proposal, index) => (
//             <UiEntity
//               uiTransform={{
//                 width: '100%',
//                 height: '10%',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'space-between'
//               }}
//               uiBackground={{ color: Color4.fromHexString('#70ac76ff') }}
//             >
//               <Label
//                 uiTransform={{
//                   width: '100%',
//                   height: 20,
//                   margin: '8px 0'
//                 }}
//                 value={`Name: ${proposal.title}`}
//                 fontSize={24}
//               />
//               <Button
//                 uiTransform={{ width: 150, height: 40, margin: 4 }}
//                 value="Open proposal"
//                 variant="primary"
//                 fontSize={18}
//                 onMouseDown={() => {
//                   void openExternalUrl({
//                     url: `https://decentraland.org/governance/proposal/?id=${proposal.id}`
//                   })
//                 }}
//               />
//             </UiEntity>
//           ))}
//         <Button
//           uiTransform={{ width: 100, height: 40, margin: 4 }}
//           value="Close"
//           variant="primary"
//           fontSize={18}
//           onMouseDown={() => {
//             this.display = false
//           }}
//         />
//       </UiEntity>
//     ))
//   }
//   // display ui and set vote
//   displayUi(proposals: any[]) {
//     this.proposals = proposals
//     console.log(proposals)

//     this.display = true
//   }
// }
