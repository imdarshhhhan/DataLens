
# DataLens — AI-Assisted Data Analytics Application

**DataLens** is an AI-powered data analytics platform that allows users to upload **CSV, Excel, and JSON datasets**, query their data using **natural language**, generate automated analytical insights, and export results without requiring SQL knowledge.

The platform combines **LLMs, Natural Language-to-SQL generation, DuckDB, FastAPI, React.js, and secure authentication** to provide an interactive and scalable data exploration experience.

---

## Key Features

###  Multi-Format Dataset Upload

Upload datasets in:

* CSV
* Excel
* JSON

DataLens automatically processes the uploaded dataset and prepares it for analysis.

###  Natural Language Data Querying

Users can ask questions about their dataset using natural language instead of writing SQL.

**Example:**

> "What are the top 10 products by revenue?"

DataLens converts the natural-language question into SQL and executes it against the uploaded dataset.

###  NL-to-SQL Pipeline

DataLens uses **Groq LLaMA 3.3 70B** to translate natural-language questions into SQL queries.

The generated SQL is then executed using **DuckDB**, which provides efficient analytical querying over structured data.

The pipeline also includes:

* SQL generation
* SQL validation
* Automatic error detection
* SQL auto-correction
* Confidence scoring
* Query execution

###  AI-Powered Insights

After a dataset is uploaded, DataLens generates context-aware analytical insights using an LLM.

The insight engine can generate:

* Key observations
* Trends
* Patterns
* Important statistics
* Potential anomalies
* Follow-up questions

The platform generates approximately **8–12 analytical observations** for each uploaded dataset.

### Data Visualization

Query results and dataset information are presented through an interactive frontend, allowing users to understand their data through visual representations and analytical results.

### Secure Authentication

DataLens provides multiple authentication mechanisms:

* JWT authentication
* bcrypt password hashing
* Google OAuth
* Guest sessions

Guest sessions automatically expire after **7 days**.

### User Data Isolation

Each user's datasets, queries, and session information are isolated to prevent unauthorized access to another user's data.

### Session & Query Management

The platform includes:

* Session caching
* Query history
* Persistent user sessions
* Guest-session cleanup
* Concurrent user support

###  Export

Users can export analytical results and reports in:

* PDF
* CSV
                                    

# Application Flow

## 1. Dataset Upload

The user uploads a CSV, Excel, or JSON file through the React frontend.

```text
User
  ↓
Upload Dataset
  ↓
FastAPI
  ↓
Validate & Process File
  ↓
Prepare Dataset for Analysis
```

---

## 2. Dataset Analysis

Once the dataset is uploaded, DataLens analyzes its structure and prepares the data for querying.

The system identifies the available dataset structure and makes it available to the query and insight engines.

---

## 3. Natural Language Query

The user enters a question such as:

```text
"Which category generated the highest revenue?"
```

The request is sent to the FastAPI backend.

```text
Natural Language Question
            ↓
        FastAPI
            ↓
     Groq LLaMA 3.3
            ↓
       SQL Query
```

---

## 4. SQL Validation & Correction

Before execution, the generated SQL goes through validation.

If an error is detected:

```text
Generated SQL
      ↓
SQL Validation
      ↓
 ┌────┴─────┐
 │          │
Valid      Invalid
 │          │
 ↓          ↓
Execute   Auto-Correct
            │
            ↓
        Re-Validate
```

This makes the natural-language querying pipeline more reliable.

---

## 5. Query Execution

Validated SQL queries are executed using **DuckDB**.

```text
Validated SQL
      ↓
    DuckDB
      ↓
Query Result
```

DuckDB enables DataLens to perform analytical queries efficiently on uploaded datasets.


### Dataset → Insights

```text
Uploaded Dataset
       ↓
Dataset Context
       ↓
LLM Insight Engine
       ↓
Analytical Observations
       ↓
Trends / Patterns / Insights
       ↓
Follow-up Questions
```

---

# 🛠️ Tech Stack

## Frontend

* React.js
* JavaScript
* REST API integration

## Backend

* FastAPI
* Python
* REST APIs

## AI / LLM

* Groq API
* LLaMA 3.3 70B

## Data Analytics

* DuckDB
* Pandas

## Database / Storage

* SQLite

## Authentication

* JWT
* bcrypt
* Google OAuth

## Deployment

* Vercel
* GitHub

---

#  Project Structure

```text
DataLens/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── utils/
│   ├── main.py
│   └── requirements.txt
│
├── README.md
└── .gitignore
```

> The exact structure may vary depending on the implementation and deployment configuration.

---

# ⚙️ Installation & Setup

## Prerequisites

Make sure the following are installed:

* Python 3.x
* Node.js
* npm
* Git

You will also need a **Groq API key** for the LLM functionality.

---

## 1. Clone the Repository

```bash
git clone imdarshhhhan

cd DataLens
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it.

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```


## 3. Start the Backend

```bash
uvicorn main:app --reload
```

The FastAPI server will start locally.

---

## 4. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The React application will then be available through the local development URL shown by Vite.


User-specific datasets and query history are isolated to support concurrent users.

---

#  Performance & Scalability

DataLens is designed to support analytical queries on datasets containing up to approximately **100K rows**.

Key architectural decisions include:

* DuckDB for analytical SQL execution
* Session caching
* Efficient query processing
* Automatic SQL correction
* User-level data isolation
* Stateless REST API architecture


# 📊 Example Use Case

Suppose a user uploads:

```text
sales_data.csv
```

Containing:

```text
Product
Category
Region
Revenue
Quantity
Date
```

Instead of writing:

```sql
SELECT category, SUM(revenue)
FROM sales
GROUP BY category
ORDER BY SUM(revenue) DESC;
```

the user can simply ask:

> **"Which category generated the most revenue?"**

DataLens handles the process:

```text
Natural Language
       ↓
Groq LLaMA
       ↓
SQL Generation
       ↓
SQL Validation
       ↓
DuckDB Execution
       ↓
Result
       ↓
Visualization / Insight
```

---

#  Why DataLens?

Traditional data analysis often requires users to understand:

* SQL
* Data cleaning
* Query syntax
* Visualization tools
* Statistical interpretation

DataLens reduces this complexity by providing a natural-language interface for exploring datasets.

The goal is simple:

> **Upload your data. Ask questions. Get insights.**

---

# 🔮 Future Improvements

Potential improvements include:

* Advanced visualization recommendations
* Streaming analysis for larger datasets
* Advanced statistical analysis
* More LLM providers
* Query optimization
* Collaborative dataset analysis

---

# Author

**Darshan**

MCA Student | Software Developer

Interested in:

* Software Development
* Data Structures & Algorithms
* AI/ML
* Full-Stack Development

