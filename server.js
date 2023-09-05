const express =require("express"); 
const app = express();
const { pool } = require("./dbConfig.js")                                                         //database configuration file
const bcrypt =require("bcrypt")
const session = require("express-session")
const flash = require("express-flash")
const passport =require("passport")

const intializePassport = require("./passportConfig")
intializePassport(passport)

const port = process.env.port ||8080
app.use(express.static('public')) 

app.set('view engine','ejs')                                                                         //Express run Engine
app.use(express.urlencoded({extended :false}))                                                      //set middleware to send frontend data to backend

app.use(
  session(
    {
      secret:"secret",                                                                            //secure and efficient session management 
      resave:false,
      saveUninitialized :false
    }
  )
)
app.use(passport.initialize())
app.use(passport.session())


app.use(flash())




app.get("/",(req,res) =>                                                                              //get method
{
  res.render('index')
})

app.get("/users/register", checkAthenticated, (req,res) =>
{
  res.render('register')
})

app.get("/users/login",checkAthenticated, (req,res) =>
{
  res.render('login')
})

app.get("/users/dashboard",checkNotAuthenticated,(req,res) =>
{
  console.log(req.isAuthenticated());
  res.render('dashboard', {user: req.user.name})
})

app.get("/users/logout",(req,res) =>
{
    req.logout(()=>{
      req.flash("success_message","You have log out") ,
     res.redirect( '/users/login')
  
    })
    
})

app.post('/users/register', async(req,res)=>{                                                                  //Post method to render the data
  let { name, email,password,password2 } = req.body
  console.log({
    name,
    email,
    password,
    password2
  })
  let errors=[]

  if (!name ||!email || !password || !password2){
    errors.push({message:"please enter all details"})
  }
   if (password.length < 6){
    errors.push({message:"password should be more than or atleast 6 character "})                             //defined errors 
   }

   if (password != password2){
    errors.push({message:"Passwords Do not Match"})
   }
   if(errors.length > 0){
    res.render('register',{errors})
   }else {
                                                                                                            // Form Validation Passed Ecrypt the password 
        let hashedPassword = await bcrypt.hash(password,10)                                                //$2b$10$XJqTPvD5tnj.UhMoXKAGvOOtZy8TtW0fByNY7E.j.Vow/1ktpcP8e -hashed password
        console.log(hashedPassword)


        pool.query(`select * from users where email =$1`, [email],(err,result)=>{                        //reaches here { id: 1, name: 'test', email: 'test@gmail.com', password: 'tes1234' }
         
          
          if(err) {
                  throw err
          }
             
             console.log(result.rows)

             if(result.rows.length > 0 ){
              errors.push({message:"Email already registered"})
              res.render('register',{errors})
             }else{
              pool.query(
                `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)  RETURNING id, password`,[name, email, hashedPassword],
                (err, results) => {
                  if (err) {
                    throw err;
                  }
                  console.log(results.rows);
                  req.flash('success_message', "User Registered successfully, Please log in");
                  res.redirect("/users/login");
                } )
              
             }
        }
        )

   }


})

app.post('/users/login',passport.authenticate('local',{
  successRedirect: "/users/dashboard" ,
  failureRedirect: "/users/login" ,
  failureFlash:true

})
)

function checkAthenticated(req,res,next){
  if (req.isAuthenticated()){
    return res.redirect("/users/dashboard")
  }
  next()
}

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/users/login')
}


app.listen(port,()=>
console.log("server running on port",{port}))