import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient().$extends({
  result: {
    user: {
      createDate: {
        needs: { createdAt: true },
        compute(user) {
          return new Date(user.createdAt).toLocaleString()
        },
      },
    },
    post: {
      createDate: {
        needs: { createdAt: true },
        compute(post) {
          return new Date(post.createdAt).toLocaleString()
        },
      },
      updated: {
        needs: { updatedAt: true },
        compute(post) {
          return new Date(post.updatedAt).toLocaleString()
        },
      },
    }
  },
})

/*  Create */
async function createRow(collectionName, data){
  console.log("create row")
  const res = await prisma[collectionName].create({data})
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })

  return res
}

/*  Read rows */
export async function readRows(collectionName, data = '') {
  const res = await prisma[collectionName].findMany(data)
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
  return res
}

/*  Read row */
async function readRow(collectionName, data = '') {
  const res = await prisma[collectionName].findFirstOrThrow(data)
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
  return res
}

/*  Update  */
async function updateRow(collectionName, where, data){
  const res = await prisma[collectionName].update({
    where,
    data
  })
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })

  return res
}

/*  DELETE  */
async function deleteRow(collectionName, where){
  await prisma[collectionName].delete({
    where
  })
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
}

/*  Delete Many */
async function deleteRows(collectionName, where){
  await prisma[collectionName].deleteMany({
    where
  })
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
}

/*  Count Rows */
async function countRows(collectionName){
  const res = await prisma[collectionName].count()
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
  return res
}


/*  Count Multiple Rows*/
async function countsRows(collectionsName){
  //const res = await prisma[collectionName].count()
  let parr = []
  for(let i=0; i<collectionsName.length; i++){
    parr.push(prisma[collectionsName[i]].count())
  }
  const res = await Promise.all(parr)
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
  return res
}

async function findUnique(collectionName, where){
  const res = await prisma[collectionName].findUnique({
    where
  })
  .catch(err => {throw new Error(err)})
  .finally(async () => {
    await prisma.$disconnect()
  })
  return res
}

export {findUnique, readRow, createRow, updateRow, deleteRow, deleteRows, countRows, countsRows}