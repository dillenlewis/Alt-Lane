const express = require('express')
const router = express.Router()
const db = require('../db')
const verifyToken = require('../middleware/verifytoken')
const verifyPass = require('../middleware/verifypassword')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const cors = require('cors')
/* GET users listing. */
// router.get('/', function (req, res, next) {
//   res.send('respond with a resource')
// })

// Getting all fields from all users except password

cors({origin: 'http://localhost:3000', credentials: true })
router.get('/login', async function (req, res) {
  try {
    const email = req.body.email  //JOIN mentorship ON users.id=mentorship.mentor_id
    const password = req.body.password
    const data = await db.any(`SELECT users.id, users.user_type, users.password FROM users where users.email = '${email}'`)
     //test password equality
     
     let samePassword = verifyPass(password, data[0].password)
     console.log(samePassword)
     //if password matches
    
     
     if(samePassword)
      jwt.sign({data}, 'secretKey', {expiresIn: '3600s'}, async (err, token)=>{
       await res.status(202).cookie('token', token, {sameSite:'strict', httpOnly: true}).json({
         data,
         token
       })
       
      })
      console.log(req.headers)
       }catch(err){
     res.status(404).send(err)
   }
 });
  

router.get('/', async function (request, response) {
  try {
    const data = await db.any('SELECT id, first_name, last_name, email, photo_url, user_type FROM users')
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
    const data = await db.any(`SELECT id, first_name, last_name, email, photo_url, user_type FROM users WHERE id=${getUser}`)
    return response.json({
      data: data
    })
  } catch (err) {
    response.status(404).send(err)
  }
})

// Getting password of user with specified id
router.get('/pass/:id', async function (request, response) {
  try {
    const getPass = parseInt(request.params.id)
    const data = await db.any(`SELECT password FROM users WHERE id=${getPass}`, request.body)
    return response.json({
      data: data
    })
  } catch (err) {
    response.status(404).send(err)
  }
})

router.post('/', async function (request, response) {
  try {
    await db.none('INSERT INTO users (first_name, last_name, email, password, photo_url, user_type) VALUES (${first_name}, ${last_name}, ${email}, ${password}, ${photo_url}, ${user_type})', request.body)

    return response.send(
      `The following user has been added: ${request.body.first_name} ${request.body.last_name}`
    )
  } catch (err) {
    response.status(404).send(err)
  }
})

router.patch('/:id', verifyToken, async function (request, response) {
  jwt.verify(request.token, 'secretKey', async (err, authData) => {
    console.log(authData)
    if(err){
      response.sendStatus(403)
    } 
    else if(authData.data[0].id !== parseInt(request.params.id)){
      response.sendStatus(500)
      console.log('not working')
    }else {
      console.log(authData.data[0].id)
        try {
        const updateUsers = parseInt(request.params.id)
        let first_name = request.body.first_name
        let last_name = request.body.last_name
        let email = request.body.email
        let password = request.body.password
        let photo_url = request.body.photo_url
        if (first_name) await db.any(`UPDATE users SET first_name='${first_name}' WHERE id=${updateUsers}`)
    
        if (last_name) await db.any(`UPDATE users SET last_name='${last_name}' WHERE id=${updateUsers}`)
    
        if (email) await db.any(`UPDATE users SET email='${email}' WHERE id=${updateUsers}`)
        
        if (password) {
          let hashed = bcrypt.hashSync(request.body.password, 10)
          await db.any(`UPDATE users SET password='${hashed}' WHERE id=${updateUsers}`)
        }
        if (photo_url) await db.any(`UPDATE users SET photo_url='${photo_url}' WHERE id=${updateUsers}`)
    
        return response.send(
          
          `The following user id name has been updated: ${updateUsers}`
        )
      } catch (err) {
        console.log(err)
        response.status(404).send(err)
      }
  }
  })
})

router.delete('/:id', async function (request, response) {
  try {
    const deleteUser = parseInt(request.params.id)
    await db.none('DELETE FROM users WHERE id=$1', deleteUser)

    return response.send(
      `The following user id has been deleted: ${deleteUser}`
    )
  } catch (err) {
    response.status(404).send(err)
  }
})

module.exports = router
