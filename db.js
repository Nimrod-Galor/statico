import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createRow(collectionName, data){
  console.log("create row")
  const res = await prisma[collectionName].create({data})
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })

  return res
}

async function getAll(collectionName) {
  const res = await prisma[collectionName].findMany()
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
  return res
}

export default async function getBy(collectionName, filter){
  const res = await prisma[collectionName].findFirstOrThrow({
    where: filter
    // {
    //   email: email
    // }
  })
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
  return res
}

async function getPagination(collectionName, skip, take, select, where = {}, orderBy = {}){
  const res = await prisma[collectionName].findMany({
    skip,
    take,
    where,
    select,
    orderBy
  })
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
  return res
}

async function updateRow(collectionName, filter, data){
  const res = await prisma[collectionName].update({
    where: filter,
    data
  })
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })

  return user
}

async function deleteRow(collectionName, filter){
  await prisma[collectionName].update({
    where: filter
  })
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
}

export {getAll, getBy, createRow, updateRow, deleteRow, getPagination}