const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");

const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);

app.use(cors());
app.use(express());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, "kuttamoiravoot", (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://ass12:DfkwzAjJkpP0OXyr@cluster0.l8qsm1e.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const course = client.db("summercamp").collection("courses");
    const userCollection = client.db("summercamp").collection("users");
    const myclasses = client.db("summercamp").collection("myclasses");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, "kuttamoiravoot", { expiresIn: "1h" });
      res.send({ token });
    });

//    const verifyAdmin = async (req, res, next) => {
//      const email = req.user.email;
//      const query = { email: email };
//      const user = await userCollection.findOne(query);
//      if (user.role !== "admin") {
//        return res
//          .status(403)
//          .send({ error: true, message: "Forbiddenn access" });
//      }
//      next();
//    };
//    const verifyfaculty = async (req, res, next) => {
//      const email = req.user.email;
//      const query = { email: email };
//      const user = await userCollection.findOne(query);
//      if (user.role !== "faculty") {
//        return res
//          .status(403)
//          .send({ error: true, message: "Forbidden access" });
//      }
//      next();
//    };

    //user email all data

//    //payment
//    app.post("/stripe/charge", cors(), async (req, res) => {
//      console.log("stripe-routes.js 9 | route reached", req.body);
//      let { amount, id } = req.body;
//      console.log("stripe-routes.js 10 | amount and id", amount, id);
//      try {
//        const payment = await stripe.paymentIntents.create({
//          amount: amount,
//          currency: "USD",
//          description: "Your Company Description",
//          payment_method: id,
//          confirm: true,
//        });
//        console.log("stripe-routes.js 19 | payment", payment);
//        res.json({
//          message: "Payment Successful",
//          success: true,
//        });
//      } catch (error) {
//        console.log("stripe-routes.js 17 | error", error);
//        res.json({
//          message: "Payment Failed",
//          success: false,
//        });
//      }
//    });
    /////////////////
    //myclasses
    app.post("/myclasses", async (req, res) => {
      const additem = req.body;

      try {
        const existingDocument = await myclasses.findOne({
          courseId: additem.courseId,
        });

        if (existingDocument) {
          // Document with the same _id already exists
          return res.status(409).send("This class has already been added.");
        }

        const result = await myclasses.insertOne(additem);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while saving the form data.");
      }
    });







    app.get("/myclasses/:email", async (req, res) => {
      const email = req.params.email;

      try {
        const result = await myclasses.find({ email: email }).toArray();

        if (result.length > 0) {
          res.status(200).send(result);
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "An error occurred while retrieving the user" });
      }
    });

    app.get("/myclass/:id", async (req, res) => {
      const courseId = req.params.id;

      try {
        const result = await myclasses.findOne({ _id: new ObjectId(courseId) });

        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: "Course not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "An error occurred while retrieving the course" });
      }
    });
    app.post("/myclass/:id", async (req, res) => {
      const courseId = req.params.id;
      const { paymentStatus } = req.body;

      try {
        const result = await myclasses.updateOne(
          { _id: new ObjectId(courseId) },
          { $set: { ok: paymentStatus } },
        );

        if (result.modifiedCount === 1) {
          res
            .status(200)
            .json({ message: "Payment status updated successfully" });
        } else {
          res.status(404).json({ message: "Course not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            message: "An error occurred while updating the payment status",
          });
      }
    });

//    app.put("/myclass/:id", async (req, res) => {
//      const courseId = req.params.id;
//      const { payment } = req.body;
//
//      try {
//        const result = await myclasses.updateOne(
//          { _id: new ObjectId(courseId) },
//          {
//            $set: {
//              payment: payment,
//            },
//          },
//        );
//
//        if (result.modifiedCount === 1) {
//          res
//            .status(200)
//            .json({ message: "Payment status updated successfully" });
//        } else {
//          res.status(404).json({ message: "Course not found" });
//        }
//      } catch (error) {
//        console.error(error);
//        res.status(500).json({
//          message: "An error occurred while updating the payment status",
//        });
//      }
//    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;

      try {
        const result = await userCollection.findOne({ email: email });

        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "An error occurred while retrieving the user" });
      }
    });




app.get("/use/faculty", async (req, res) => {
  try {
    const result = await userCollection.find({ role: "faculty" }).toArray();

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No users found with the role 'faculty'" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while retrieving the data" });
  }
});

/////
///user start
//////

    app.get("/users", async (req, res) => {
      const showuser = await userCollection.find().toArray();
      res.send(showuser);
    });

    app.patch("/userall/:id", async (req, res) => {
      const id = req.params.id;
    const { role } = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
           role: role || "",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });



    app.post('/users', async(req,res) => {
        const user = req.body;
        const query = {email: user.email};
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
            return res.send({message: 'User Already Exists'})
        }
        const result = await userCollection.insertOne(user);
        res.send(result)
    })

    app.get("/courses", async (req, res) => {
      const showuser = await course.find().toArray();
      res.send(showuser);
    });
//app.put("/courses/:id", async (req, res) => {
//  const courseId = req.params.id;
//
//  try {
//    const result = await courses.updateOne(
//      { _id: courseId },
//      { $inc: { enroll: 1 } }
//    );
//
//    if (result.modifiedCount > 0) {
//      res.status(200).json({ message: "Course updated successfully" });
//    } else {
//      res.status(404).json({ message: "Course not found" });
//    }
//  } catch (error) {
//    console.error(error);
//    res.status(500).json({ message: "An error occurred while updating the course" });
//  }
//});

 app.get("/course/:email", async (req, res) => {
      const email = req.params.email;

      try {
        const result = await course.find({ email: email }).toArray();

        if (result.length > 0) {
          res.status(200).send(result);
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "An error occurred while retrieving the user" });
      }
    });
    app.post("/courses", async (req, res) => {
      const additem = req.body;

      try {
        const result = await course.insertOne(additem);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while saving the form data.");
      }
    });

    app.delete("/courses/:id", async (req, res) => {
      const courseId = req.params.id;

      try {
        const result = await course.deleteOne({ _id: new ObjectId(courseId) });

        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Course deleted successfully" });
        } else {
          res.status(404).json({ message: "Course not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "An error occurred while deleting the course" });
      }
    });
    app.put("/courses/:id", async (req, res) => {
      const courseId = req.params.id;
      const updateData = req.body;
      const { _id, ...updatedFields } = updateData; // Exclude _id from updatedFields

      try {
        const result = await course.findOneAndUpdate(
          { _id: new ObjectId(courseId) },
          { $set: updatedFields },
          { returnOriginal: false }, // Return the updated document
        );

        if (result) {
          res
            .status(200)
            .json({ message: "Course updated successfully", data: result });
        } else {
          res.status(404).json({ message: "Course not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "An error occurred while updating the course" });
      }
    });
//    app.put("/courses/:id", async (req, res) => {
//      const courseId = req.params.id;
//      const updateData = req.body;
//      delete updateData._id; // Exclude the _id field from the update
//
//      try {
//        const result = await course.updateOne(
//          { _id: new ObjectId(courseId) },
//          { $set: updateData },
//        );
//
//        if (result.modifiedCount === 1) {
//          res.status(200).json({ message: "Course updated successfully" });
//        } else {
//          res.status(404).json({ message: "Course not found" });
//        }
//      } catch (error) {
//        console.error(error);
//        res
//          .status(500)
//          .json({ message: "An error occurred while updating the course" });
//      }
//    });
    app.get("/courses/:id", async (req, res) => {
      const courseId = req.params.id;

      try {
        const result = await course.findOne({ _id: new ObjectId(courseId) });

        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: "Course not found" });
        }
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ message: "An error occurred while retrieving the course" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("red horse is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
