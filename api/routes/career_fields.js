const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', async function (request, response) {
  try {
    const data = await db.any('SELECT * FROM career_fields')
    return response.json({
      data: data
    })
  } catch (err) {
    response.status(404).send(err)
  }
})

router.get('/:id', async function (request, response) {
  try {
    const getUser = parseInt(request.params.id)
    const data = await db.any(`SELECT * FROM career_fields WHERE id=${getUser}`)
    return response.json({
      data: data
    })
  } catch (err) {
    response.status(404).send(err)
  }
})

router.post('/', async function (request, response) {
  try {
    await db.none('INSERT INTO career_fields (name) VALUES (${name})', request.body)

    return response.send(
      `The following career_field has been added: ${request.body.name}`
    )
  } catch (err) {
    response.status(404).send(err)
  }
})

router.patch('/:id', async function (request, response) {
  try {
    const updateUser = parseInt(request.params.id)
    await db.any(`UPDATE career_fields SET name=$<name> WHERE id=${updateUser}`, request.body)

    return response.send(
      `The following career field id has been updated: ${updateUser}`
    )
  } catch (err) {
    console.log(err)
    response.status(404).send(err)
  }
})

router.delete('/:id', async function (request, response) {
  try {
    const deleteUser = parseInt(request.params.id)
    await db.none('DELETE FROM career_fields WHERE id=$1', deleteUser)

    return response.send(
      `The following career_field id has been deleted: ${deleteUser}`
    )
  } catch (err) {
    response.status(404).send(err)
  }
})

module.exports = router