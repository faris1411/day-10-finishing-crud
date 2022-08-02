const express = require('express')
const app = express()
const port = 3000
const moment = require('moment')
const path = require('path')
const db = require ('./connection/db') // get connection script

app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))

// Routes
app.get('/', (req, res) => {
  db.connect((err, client, done) => {
    if (err) throw err
    client.query('SELECT * FROM tb_projects', (err, result) => {
      done()
      if (err) throw err
      let data = result.rows
      data = data.map((project) => {
        if (project.technologies) {
          if (project.technologies.includes('nodejs')) {
            project.nodejs = true
          }
          if (project.technologies.includes('nextjs')) {
            project.nextjs = true
          }
          if (project.technologies.includes('reactjs')) {
            project.reactjs = true
          }
          if (project.technologies.includes('typescript')) {
            project.typescript = true
          }
        }
        project.duration = getDuration(project.start_date, project.end_date)
        return project
      })
      res.render('index', {projects: data})
    })
  })
})

// Project detail
app.get('/project/:id', (req, res) => {
  db.connect((err, client, done) => {
    if (err) throw err
    client.query(`SELECT * FROM tb_projects WHERE id=${req.params.id}`, (err, result) => {
      done()
      if (err) throw err
      let data = result.rows
      data = data.map((project) => {
        if (project.technologies) {
          if (project.technologies.includes('nodejs')) {
            project.nodejs = true
          }
          if (project.technologies.includes('nextjs')) {
            project.nextjs = true
          }
          if (project.technologies.includes('reactjs')) {
            project.reactjs = true
          }
          if (project.technologies.includes('typescript')) {
            project.typescript = true
          }
        }
        project.duration = getDuration(project.start_date, project.end_date)
        project.start_date = moment(project.start_date).locale('id').format('ll')
        project.end_date = moment(project.end_date).locale('id').format('ll')
        return project
      })
      res.render('project-detail', {project: data[0]})
    })
  })
})

app.get('/add-project', (req, res) => {
  res.render('add-project')
})

// Add project to db
app.post('/add-project', (req, res) => {
  const { name, start_date, end_date, description, technologies, image } = req.body
  db.connect((err, client, done) => {
    if (err) throw err
    const query = `
      INSERT INTO tb_projects(name, start_date, end_date, description, technologies, image)
      VALUES ('${name}', '${start_date}', '${end_date}', '${description}', '{${technologies}}', '${image}')
    `
    client.query(query, (err) => {
      done()
      if (err) throw err
      res.redirect('/')
    })
  })
})

// edit project form
app.get('/edit-project/:id', (req, res) => {
  const id = req.params.id
  db.connect((err, client, done) => {
    if (err) throw err
    const query = `SELECT * FROM tb_projects WHERE id=${id}`
    client.query(query, (err, result) => {
      done()
      if (err) throw err
      let data = result.rows[0]
      if (data.technologies) {
        if (data.technologies.includes('nodejs')) {
          data.nodejs = true
        }
        if (data.technologies.includes('nextjs')) {
          data.nextjs = true
        }
        if (data.technologies.includes('reactjs')) {
          data.reactjs = true
        }
        if (data.technologies.includes('typescript')) {
          data.typescript = true
        }
      }
      const project = {
        ...data,
        start_date: data.start_date.toISOString().substring(0, 10),
        end_date: data.end_date.toISOString().substring(0, 10),        
      }
      res.render('edit-project', {project: project})
    })
  })
})

// update project to db
app.post('/edit-project/:id', (req, res) => {
  const id = req.params.id
  const {name, start_date, end_date, description, technologies, image} = req.body
  db.connect((err, client, done) => {
    if (err) throw err
    const query = `
      UPDATE tb_projects
      SET name='${name}', start_date='${start_date}', end_date='${end_date}', description='${description}', technologies='{${technologies}}', image='${image}'
      WHERE id=${id}
    `
    client.query(query, (err) => {
      done()
      if (err) throw err
      res.redirect('/')
    })
  })
})

// delete project from db
app.get('/delete-project/:id', (req, res) => {
  const id = req.params.id
    db.connect ((err, client, done) => {
      if (err) throw err
      const query = `
        DELETE FROM tb_projects
        WHERE id=${id};
      `
      client.query(query, (err) => {
        done()
        if (err) throw err
        res.redirect('/')
      })
    })
})

app.get('/contact', (req, res) => {
  res.render('contact')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function getDuration(startDate, endDate) {
  const a = moment(endDate)
  const b = moment(startDate)

  let month = a.diff(b, 'month');
  let duration = '';

  if (month == 12) {
    duration = '1 tahun';
  } else if (month > 12) {
    let year = a.diff(b, 'year');
    month %= 12; // calculate exceeding month
    if (month == 0) {
      duration = `${year} tahun`;
    } else {
      duration = `${year} tahun ${month} bulan`;
    }
  } else {
    duration = `${month} bulan`
    if (month < 1) {
      let day = a.diff(b, 'day');
      duration = `${day} hari`;
    }
  }
  return duration
}