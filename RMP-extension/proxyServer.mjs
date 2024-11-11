import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.post("/graphql", async (req, res) => {
    try {
        const response = await fetch("https://www.ratemyprofessors.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic dGVzdDp0ZXN0",
                "Accept": "*/*",
                "Connection": "keep-alive",
                "User-Agent": "PostmanRuntime/7.42.0",
                "Accept-Encoding": "gzip, deflate, br",
            },
            body: JSON.stringify({
                query: `query NewSearchTeachersQuery($query: TeacherSearchQuery!, $count: Int) {
                          newSearch {
                            teachers(query: $query, first: $count) {
                              edges {
                                node {
                                  legacyId
                                  firstName
                                  lastName
                                  avgRating
                                }
                              }
                            }
                          }
                        }`,
                variables: {
                    query: {
                        text: req.body.professorName,
                        schoolID: "U2Nob29sLTIyMw=="
                    },
                    count: 10
                }
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});

app.get("/professor/:legacyId", async (req, res) => {
    try {
        const professorPageResponse = await fetch(`https://www.ratemyprofessors.com/professor/${req.params.legacyId}`);
        if (!professorPageResponse.ok) throw new Error(`HTTP error! status: ${professorPageResponse.status}`);
        
        const pageHtml = await professorPageResponse.text();

        const ratingMatch = pageHtml.match(/<div class="RatingValue__Numerator-qw8sqy-2 liyUjw">([\d.]+)<\/div>/);
        const rating = ratingMatch ? ratingMatch[1] : "N/A";
        
        res.json({ rating });
    } catch (error) {
        res.status(500).json({ error: "Error fetching professor page" });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
