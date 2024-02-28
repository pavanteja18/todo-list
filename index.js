import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  password: '12345678',
  database: 'permalist',
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getItem(){
    const result = await db.query('SELECT * FROM items');
    return result; 
}

app.get("/", async (req, res) => {
  try {
    const result = await getItem();
    console.log(result.rows);
    items = result.rows;
    res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
  }
  catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log(item);
  try {
    const response  = await db.query('INSERT INTO items (title) VALUES ($1);', [item]);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
  items.push({ title: item });
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  try {
    const result = await db.query('UPDATE items SET title = $1 WHERE id = $2', [req.body.updatedItemTitle , req.body.updatedItemId])
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  try {
    const result = await db.query("DELETE FROM items WHERE id = $1", [req.body.deleteItemId]);
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
