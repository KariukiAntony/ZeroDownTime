import express, {Express, Request, Response} from "express"
import morgan from "morgan"
import cors from "cors"
import os from "os"
import moment from "moment"


const app:Express = express()
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))
app.use(express.urlencoded({extended: true}))
app.options("*", cors());


//Sample data to simulate a database
const users = [
    {"id": 1, "name": "Alice", "email": "alice@example.com"},
    {"id": 2, "name": "Bob", "email": "bob@example.com"},
    {"id": 3, "name": "Antony", "email": "antony@example.com"}
]

const json_response = (data: String) => {
    const datetime = moment().format("YYYY-MM-DD hh:mm:ss")
    const response = {
        "_version": "v1.0.0",
        "_host": os.hostname(),
        "_time": datetime,
        "_data": data
    }
    return response
}

app.get("/api/healthcheck", (req: Request, res: Response) => {
    res.status(200).json(json_response("Api is healthy. Happy rolling updates."))
})

app.get("/api/users", (req: Request, res: Response) => {
    res.status(200).json(users)
})

const PORT  = 3000

app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}`)
})