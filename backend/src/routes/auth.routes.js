import {Router} from "express"
import { login, logout, registerUser } from "../controllers/auth.controllers.js"
import { isLoggedIn } from "../middlewares/auth.middlewares.js"

const userRoutes=Router()

userRoutes.post("/signup",registerUser)
userRoutes.post("/login", login)
userRoutes.get("/logout",isLoggedIn,logout)

export default userRoutes