COURSES_AND_TESTS = [
    {
        "title": "Basic Physics",
        "description": "Fundamental concepts of physics including mechanics, thermodynamics, and electromagnetism.",
        "tests": [
            {
                "title": "Newton's Laws of Motion",
                "description": "Test your knowledge of the three fundamental laws of motion.",
                "questions": [
                    {"q": "Which of Newton's Laws states that an object at rest stays at rest unless acted upon by an external force?", "options": ["First Law", "Second Law", "Third Law", "Fourth Law"], "answer": 0},
                    {"q": "Newton's Second Law of Motion is expressed as:", "options": ["F = mv", "F = ma", "F = m/a", "F = v/a"], "answer": 1},
                    {"q": "Newton's Third Law states that for every action:", "options": ["There is a double reaction", "There is an equal and opposite reaction", "There is no reaction", "There is a weaker reaction"], "answer": 1},
                    {"q": "What is the SI unit of force?", "options": ["Joule", "Watt", "Newton", "Pascal"], "answer": 2},
                    {"q": "Which quantity is conserved when no external forces act on a system?", "options": ["Energy", "Momentum", "Velocity", "Acceleration"], "answer": 1},
                ],
            },
            {
                "title": "Thermodynamics",
                "description": "Explore heat, temperature, and energy transfer concepts.",
                "questions": [
                    {"q": "Heat naturally flows from:", "options": ["Cold to hot", "Hot to cold", "High pressure to low pressure", "Low density to high density"], "answer": 1},
                    {"q": "What is the value of absolute zero in Celsius?", "options": ["-100°C", "-200°C", "-273.15°C", "-373.15°C"], "answer": 2},
                    {"q": "The First Law of Thermodynamics states that:", "options": ["Entropy always increases", "Energy cannot be created or destroyed", "Heat flows from cold to hot", "Work always produces heat"], "answer": 1},
                    {"q": "What is the SI unit of temperature?", "options": ["Celsius", "Fahrenheit", "Kelvin", "Rankine"], "answer": 2},
                    {"q": "A process that absorbs heat from its surroundings is called:", "options": ["Exothermic", "Isothermal", "Endothermic", "Adiabatic"], "answer": 2},
                ],
            },
            {
                "title": "Electromagnetism",
                "description": "Test your understanding of electric and magnetic phenomena.",
                "questions": [
                    {"q": "Ohm's Law states that V equals:", "options": ["I/R", "I+R", "I×R", "I-R"], "answer": 2},
                    {"q": "What is the SI unit of electric current?", "options": ["Volt", "Ampere", "Ohm", "Watt"], "answer": 1},
                    {"q": "Which subatomic particle carries a negative charge?", "options": ["Proton", "Neutron", "Positron", "Electron"], "answer": 3},
                    {"q": "EMF stands for:", "options": ["Electric Magnetic Force", "Electromotive Force", "Electric Motor Function", "Electron Magnetic Field"], "answer": 1},
                    {"q": "Magnetic field strength is measured in:", "options": ["Weber", "Tesla", "Gauss", "Henry"], "answer": 1},
                ],
            },
        ],
    },
    {
        "title": "Basics of Java",
        "description": "Introduction to Java programming including OOP concepts, syntax, and core libraries.",
        "tests": [
            {
                "title": "Java Fundamentals",
                "description": "Core Java syntax, data types, and basic programming concepts.",
                "questions": [
                    {"q": "Java is primarily a _____ programming language.", "options": ["Procedural", "Functional", "Object-Oriented", "Assembly"], "answer": 2},
                    {"q": "What is the correct signature of the main method in Java?", "options": ["public void main()", "public static void main(String[] args)", "static void main(String args)", "void main(String[] args)"], "answer": 1},
                    {"q": "Which keyword is used to create an object in Java?", "options": ["create", "object", "new", "make"], "answer": 2},
                    {"q": "JVM stands for:", "options": ["Java Verified Machine", "Java Virtual Machine", "Java Visual Markup", "Java Version Manager"], "answer": 1},
                    {"q": "Java source code files have the extension:", "options": [".jav", ".js", ".class", ".java"], "answer": 3},
                ],
            },
            {
                "title": "OOP Concepts",
                "description": "Object-Oriented Programming principles in Java.",
                "questions": [
                    {"q": "Which OOP concept hides internal implementation details?", "options": ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], "answer": 2},
                    {"q": "Creating a new class based on an existing class is called:", "options": ["Composition", "Inheritance", "Encapsulation", "Overloading"], "answer": 1},
                    {"q": "Method overriding is an example of:", "options": ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"], "answer": 3},
                    {"q": "A blueprint for creating objects is called a:", "options": ["Method", "Interface", "Class", "Package"], "answer": 2},
                    {"q": "The 'super' keyword refers to:", "options": ["The current class", "The parent class", "A static method", "The interface"], "answer": 1},
                ],
            },
            {
                "title": "Collections & Generics",
                "description": "Java Collections Framework and generic programming.",
                "questions": [
                    {"q": "Which collection class allows duplicate elements?", "options": ["HashSet", "TreeSet", "ArrayList", "LinkedHashSet"], "answer": 2},
                    {"q": "HashMap stores data as:", "options": ["Single values", "Key-Value pairs", "Ordered lists", "Sorted arrays"], "answer": 1},
                    {"q": "Which interface does ArrayList implement?", "options": ["Set", "Map", "Queue", "List"], "answer": 3},
                    {"q": "Generic type parameter is commonly denoted by:", "options": ["<G>", "<X>", "<T>", "<V>"], "answer": 2},
                    {"q": "Which collection maintains insertion order with no duplicates?", "options": ["HashSet", "TreeSet", "LinkedHashSet", "ArrayDeque"], "answer": 2},
                ],
            },
        ],
    },
    {
        "title": "C++ Basics",
        "description": "Introduction to C++ programming with focus on syntax, OOP, and memory management.",
        "tests": [
            {
                "title": "C++ Fundamentals",
                "description": "Basic syntax, I/O, and foundational C++ concepts.",
                "questions": [
                    {"q": "C++ was developed as an extension of which language?", "options": ["Java", "Python", "C", "Pascal"], "answer": 2},
                    {"q": "Which operator is used for standard input in C++?", "options": ["<<", ">>", "->", "::"], "answer": 1},
                    {"q": "cout is used for:", "options": ["Input", "Memory allocation", "Output", "Error handling"], "answer": 2},
                    {"q": "Which header file is required for I/O operations in C++?", "options": ["stdio.h", "iostream", "conio.h", "stdlib.h"], "answer": 1},
                    {"q": "The scope resolution operator in C++ is:", "options": ["->", "::", ".", "**"], "answer": 1},
                ],
            },
            {
                "title": "OOP in C++",
                "description": "Object-oriented features including classes, inheritance, and polymorphism.",
                "questions": [
                    {"q": "Default access specifier in a C++ class is:", "options": ["public", "protected", "private", "internal"], "answer": 2},
                    {"q": "A constructor has the same name as the:", "options": ["Method", "Object", "Class", "Module"], "answer": 2},
                    {"q": "A destructor is denoted by the prefix symbol:", "options": ["!", "@", "~", "#"], "answer": 2},
                    {"q": "Syntax for public inheritance in C++ is:", "options": ["class Child extends Parent", "class Child : public Parent", "class Child inherits Parent", "class Child < Parent"], "answer": 1},
                    {"q": "Virtual functions support which OOP concept?", "options": ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"], "answer": 3},
                ],
            },
        ],
    },
    {
        "title": "SQL Basics",
        "description": "Fundamental SQL for querying and managing relational databases.",
        "tests": [
            {
                "title": "SQL Queries",
                "description": "Basic SELECT statements, filtering, and sorting.",
                "questions": [
                    {"q": "Which SQL command is used to retrieve data?", "options": ["GET", "FETCH", "SELECT", "RETRIEVE"], "answer": 2},
                    {"q": "The WHERE clause is used to:", "options": ["Sort results", "Filter rows", "Join tables", "Group data"], "answer": 1},
                    {"q": "ORDER BY sorts results in ___ order by default:", "options": ["Descending", "Random", "Ascending", "Alphabetical"], "answer": 2},
                    {"q": "The DISTINCT keyword eliminates:", "options": ["NULL values", "Duplicate rows", "Empty strings", "Foreign keys"], "answer": 1},
                    {"q": "Which clause groups rows with the same values?", "options": ["WHERE", "ORDER BY", "HAVING", "GROUP BY"], "answer": 3},
                ],
            },
            {
                "title": "Joins & Aggregates",
                "description": "SQL JOIN operations and aggregate functions.",
                "questions": [
                    {"q": "INNER JOIN returns:", "options": ["All rows from left table", "All rows from right table", "Only matching rows from both tables", "All rows from both tables"], "answer": 2},
                    {"q": "Which function counts the number of rows?", "options": ["SUM()", "AVG()", "MAX()", "COUNT()"], "answer": 3},
                    {"q": "SUM(), AVG(), COUNT() are examples of:", "options": ["Scalar functions", "String functions", "Aggregate functions", "Window functions"], "answer": 2},
                    {"q": "LEFT JOIN returns:", "options": ["Only matching rows", "All rows from left + matching from right", "All rows from right + matching from left", "All rows from both tables"], "answer": 1},
                    {"q": "The HAVING clause is used with:", "options": ["WHERE", "ORDER BY", "GROUP BY", "JOIN"], "answer": 2},
                ],
            },
        ],
    },
]


def seed_courses_and_tests(db):
    """Seed the 4 courses and their tests if not already present."""
    import models
    if db.query(models.Course).count() > 0:
        return  # Already seeded

    for course_data in COURSES_AND_TESTS:
        course = models.Course(
            title=course_data["title"],
            description=course_data["description"],
            teacher_id=None,
        )
        db.add(course)
        db.flush()  # get course.id

        for test_data in course_data["tests"]:
            test = models.Test(
                course_id=course.id,
                title=test_data["title"],
                description=test_data["description"],
                questions=test_data["questions"],
            )
            db.add(test)

    db.commit()
    print("✅ Seeded 4 courses with tests.")
