var express = require("express");
var sqlite3 = require("sqlite3");
var router = express.Router();

const db = new sqlite3.Database("./data/articles.db", (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  }
});

const FIELDS = ["name", "price", "picture", "location", "draft"];

router.get("/all", function (req, res, next) {
  const sql = "select * from articles;";
  db.all(sql, [], (err, data) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: data.map((row) => ({
        ...row,
        draft: row.draft === 1 ? true : false,
      })),
    });
  });
});

router.get("/draft", function (req, res, next) {
  const sql = "select * from articles where draft = 1;";
  db.all(sql, [], (err, data) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data,
    });
  });
});

router.post("/", function (req, res, next) {
  const { body } = req;
  if (FIELDS.every((fieldName) => !body[fieldName])) {
    console.log("if error");
    res.status(400);
    res.json({ error: "missing parameters" });
    return;
  }

  const fields = FIELDS.filter((fieldName) => fieldName !== "draft").map(
    (fieldName) => body[fieldName] ?? null
  );

  db.run(
    `INSERT INTO articles(${FIELDS.join(",")}) VALUES(?, ?, ?, ?, 1)`,
    fields,
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      // get the last insert id
      res.status(200);
      res.json({ message: "success", id: this.lastID });
    }
  );
});

router.patch("/:id", function (req, res, next) {
  const {
    body,
    params: { id },
  } = req;
  if (FIELDS.every((fieldName) => !body[fieldName])) {
    res.status(400);
    res.json({ error: "missing parameters" });
    return;
  }

  const filteredFieldnames = FIELDS.filter((fieldName) => !!body[fieldName]);

  const updates = filteredFieldnames.map((fieldName) => `${fieldName} = ?`);

  const values = filteredFieldnames.map((fieldName) => body[fieldName]);

  db.run(
    `UPDATE articles SET ${updates.join(",")} where id = ${id};`,
    values,
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      // get the last insert id
      res.status(200);
      res.json({ message: "success", id });
    }
  );
});

router.put("/:id", function (req, res, next) {
  const {
    body,
    params: { id },
  } = req;
  if (FIELDS.every((fieldName) => !body[fieldName])) {
    console.log("if error");
    res.status(400);
    res.json({ error: "missing parameters" });
    return;
  }

  const updates = FIELDS.map((fieldName) => `${fieldName} = ?`);

  const values = FIELDS.filter((fieldName) => fieldName !== "draft")
    .map((fieldName) => body[fieldName] ?? null)
    .push(0);

  db.run(
    `UPDATE articles SET ${updates.join(",")} where id = ${id};`,
    values,
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      // get the last insert id
      res.status(200);
      res.json({ message: "success", id });
    }
  );
});

router.delete("/:id", function (req, res, next) {
  const {
    body,
    params: { id },
  } = req;

  db.run(`DELETE from articles WHERE id = ?;`, [id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    // get the last insert id
    res.status(200);
    res.json({ message: "success", id });
  });
});

module.exports = router;
