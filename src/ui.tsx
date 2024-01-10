import { engine, Transform } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity, UiComponent } from '@dcl/sdk/react-ecs'
import { openExternalUrl } from '~system/RestrictedActions'
import { getSceneInfo } from '~system/Scene'

export class VotingUI {
  display: boolean = false
  vote: 'yes' | 'no' | 'abstain' = 'abstain'
  constructor() {
    ReactEcsRenderer.setUiRenderer(() => (
      <UiEntity
        uiTransform={{
          width: 400,
          height: 150,
          margin: {
            top: -150 / 2,
            left: -400 / 2
          },
          padding: 4,
          positionType: 'absolute',
          position: { top: '50%', left: '50%' },
          display: this.display ? 'flex' : 'none'
        }}
        uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
      >
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          uiBackground={{ color: Color4.fromHexString('#70ac76ff') }}
        >
          <Label
            uiTransform={{
              width: '100%',
              height: 50,
              margin: '8px 0'
            }}
            value={`You successfully voted: ${this.vote.toUpperCase()}`}
            fontSize={24}
          />
          <Label
            uiTransform={{
              width: '100%',
              height: 50,
              margin: '8px 0'
            }}
            value={`${getPlayerPosition()}`}
            fontSize={24}
          />
          <Button
            uiTransform={{ width: 100, height: 40, margin: 4 }}
            value="Close"
            variant="primary"
            fontSize={18}
            onMouseDown={() => {
              this.display = false
            }}
          />
          <Button
            uiTransform={{ width: 150, height: 40, margin: 4 }}
            value="Open proposal"
            variant="primary"
            fontSize={18}
            onMouseDown={() => {
              void openExternalUrl({
                url: 'https://governance.decentraland.org/proposal/?id=c96c3830-4d4c-11ee-beb5-696f9c967b67'
              })
            }}
          />
        </UiEntity>
      </UiEntity>
    ))
  }
  // display ui and set vote
  displayUi(vote: 'yes' | 'no' | 'abstain') {
    console.log('displayUi', vote)

    this.vote = vote
    this.display = true
  }
}

function getPlayerPosition() {
  const playerPosition = Transform.getOrNull(engine.PlayerEntity)
  if (!playerPosition) return ' no data yet'
  const { x, y, z } = playerPosition.position
  return `{X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, z: ${z.toFixed(2)} }`
}

export class ProposalsListUI {
  display: boolean = false
  proposals: any[] = []
  constructor(proposals: any[]) {
    ReactEcsRenderer.setUiRenderer(() => (
      <UiEntity
        uiTransform={{
          width: 400,
          height: 800,
          margin: {
            top: -800 / 2,
            left: -400 / 2
          },
          padding: 4,
          positionType: 'absolute',
          position: { top: '50%', left: '50%' },
          display: this.display ? 'flex' : 'none'
        }}
        uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
      >
        {this.proposals &&
          this.proposals.map((proposal, index) => (
            <UiEntity
              uiTransform={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              uiBackground={{ color: Color4.fromHexString('#70ac76ff') }}
            >
              <Label
                uiTransform={{
                  width: '100%',
                  height: 50,
                  margin: '8px 0'
                }}
                value={`Name: ${proposal.name}`}
                fontSize={24}
              />
              <Button
                uiTransform={{ width: 150, height: 40, margin: 4 }}
                value="Open proposal"
                variant="primary"
                fontSize={18}
                onMouseDown={() => {
                  void openExternalUrl({
                    url: `https://governance.decentraland.org/proposal/?id=${proposal.id}}`
                  })
                }}
              />
            </UiEntity>
          ))}
        <Button
          uiTransform={{ width: 100, height: 40, margin: 4 }}
          value="Close"
          variant="primary"
          fontSize={18}
          onMouseDown={() => {
            this.display = false
          }}
        />
      </UiEntity>
    ))
  }
  // display ui and set vote
  displayUi(proposals: any[]) {
    this.proposals = proposals
    console.log(proposals)

    this.display = true
  }
}
