import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient().$extends({
  result: {
    user: {
      createDate: {
        needs: { createdAt: true },
        compute(user) {
          return new Date(user.createdAt).toLocaleString()
        }
      }
    },
    post: {
      createDate: {
        needs: { createdAt: true },
        compute(post) {
          return new Date(post.createdAt).toLocaleString()
        }
      },
      updated: {
        needs: { updatedAt: true },
        compute(post) {
          return new Date(post.updatedAt).toLocaleString()
        }
      }
    },
    comment: {
      createdAt: {
        needs: { createdAt: true },
        compute(post) {
          return new Date(post.createdAt).toLocaleString()
        }
      }
    }
  }
})

/*  Create */
export async function createRow(collectionName, data){
  return await prisma[collectionName].create({data})
}

/*  Read multiple rows */
export async function readRows(collectionName, data = '') {
  return await prisma[collectionName].findMany(data)
}

/*  Read single row */
export async function readRow(collectionName, data = '') {
  return await prisma[collectionName].findFirstOrThrow(data)
}

/*  Update  */
export async function updateRow(collectionName, where, data){
  return await prisma[collectionName].update({
    where,
    data
  })
}

/*  Delet single  */
export async function deleteRow(collectionName, where){
  return await prisma[collectionName].delete({
    where
  })
}

/*  Delete Many */
export async function deleteRows(collectionName, where){
  return await prisma[collectionName].deleteMany({
    where
  })
}

/*  Count Rows */
export async function countRows(collectionName, where){
  return await prisma[collectionName].count({ where })
}

/*  Count Multiple Rows*/
export async function countsRows(collectionsName, where){
  let parr = []
  for(let i=0; i<collectionsName.length; i++){
    parr.push(prisma[collectionsName[i]].count({ where: where[i] }))
  }
  return await Promise.all(parr)
}

/*  Count relations */
export async function countRelations(collectionsName, select){
  let parr = []
  for(let i=0; i<collectionsName.length; i++){
    parr.push(await prisma[collectionsName[i]].findMany({
        select: {
          _count: {
            select: select[i]
          }
        }
      })
    )
  }
  return await Promise.all(parr)
}

/*  Find Unique */
export async function findUnique(collectionName, where, select){
  const obj = { where }
  if(select){
    obj.select = select
  }
  return await prisma[collectionName].findUnique(obj)
}
