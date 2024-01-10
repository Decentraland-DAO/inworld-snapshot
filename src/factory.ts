import { Entity, engine, Transform, MeshRenderer, MeshCollider } from '@dcl/sdk/ecs'
export const Cube = engine.defineComponent('cube-id', {})

// Cube factory
export function createCube(x: number, y: number, z: number, spawner = true): Entity {
  const entity = engine.addEntity()

  // Used to track the cubes
  Cube.create(entity)

  Transform.create(entity, { position: { x, y, z } })

  // set how the cube looks and collides
  MeshRenderer.setBox(entity)
  MeshCollider.setBox(entity)

  return entity
}
