const express = require('express')
const app = express()
const {open} = require('sqlite')
app.use(express.json())
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

convertDbObjectToResponseObject = eachPlayer => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  }
}

//list of all player

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `Select * from cricket_team`
  const playersArray = await db.all(getAllPlayersQuery)

  response.send(
    playersArray.map(eachPlayer => {
      return convertDbObjectToResponseObject(eachPlayer)
    }),
  )
})

// player details based on player Id

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerIdQuery = `Select * from cricket_team where player_id = ${playerId}`
  const player = await db.get(getPlayerIdQuery)
  response.send(convertDbObjectToResponseObject(player))
})

// Creates a new player in the team (database)

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerQuery = `Insert into cricket_team (player_name,
    jersey_number,
    role)
    Values 
    (
      '${playerName}',
      ${jerseyNumber},
      '${role}'
    )`
  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

// Updates the details of a player in the team (database) based on the player ID

app.put('/players/:playerId/', async (request, response) => {
  const playerDetails = request.body
  const {playerId} = request.params

  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerQuery = `Update cricket_team set
   player_name='${playerName}', 
   jersey_number = ${jerseyNumber},
   role='${role}'
   where player_id = ${playerId}`
  const dbResposne = await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

// Deletes a player from the team (database) based on the player ID

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `Delete From cricket_team where player_id = ${playerId}`
  const dbResponse = await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
