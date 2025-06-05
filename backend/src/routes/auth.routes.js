import {Router} from "express"
import { login, logout, registerUser } from "../controllers/auth.controllers.js"
import { isLoggedIn } from "../middlewares/auth.middlewares.js"

const userRoutes=Router()

// signup route
userRoutes.post("/signup",registerUser)

// login route
userRoutes.post("/login", login)

// logout route , only logged in user can logout
userRoutes.get("/logout",isLoggedIn,logout)

export default userRoutes