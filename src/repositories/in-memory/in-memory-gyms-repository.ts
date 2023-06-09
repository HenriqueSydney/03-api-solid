import { getDistanceBetweenCoordinate } from '@/utils/get-distance-between-coordinates'
import { randomUUID } from 'node:crypto'

import { Gym, Prisma } from '@prisma/client'

import { IFindManyNearbyParams, IGymsRepository } from '../gyms-repository'

export class InMemoryGymsRepository implements IGymsRepository {
  public items: Gym[] = []

  async findById(gymId: string) {
    const gym = this.items.find((item) => item.id === gymId)

    if (!gym) {
      return null
    }

    return gym
  }

  async searchMany(query: string, page: number) {
    return this.items
      .filter((gym) => gym.title.includes(query))
      .slice((page - 1) * 20, page * 20)
  }

  async findManyNearBy(params: IFindManyNearbyParams) {
    const MAX_DISTANCE_KILOMETER_GYM_FETCH = 10
    return this.items.filter((items) => {
      const distance = getDistanceBetweenCoordinate(
        { latitude: params.latitude, longitude: params.longitude },
        {
          latitude: items.latitude.toNumber(),
          longitude: items.longitude.toNumber(),
        },
      )

      return distance < MAX_DISTANCE_KILOMETER_GYM_FETCH
    })
  }

  async create(data: Prisma.GymCreateInput) {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
      created_at: new Date(),
    }

    this.items.push(gym)

    return gym
  }
}
