document.getElementById('searchButton').addEventListener('click', async () => {
  const professorName = document.getElementById('professorName').value.trim();
  const outputDiv = document.getElementById('ratingOutput');
  outputDiv.textContent = "";

  if (!professorName) {
      outputDiv.textContent = "Please enter a professor's name.";
      return;
  }

  try {
      const response = await fetch("http://localhost:3000/graphql", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ professorName })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const legacyId = data?.data?.newSearch?.teachers?.edges[0]?.node?.legacyId;

      if (!legacyId) {
          outputDiv.textContent = `No rating found for ${professorName}.`;
          return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const professorPageResponse = await fetch(`http://localhost:3000/professor/${legacyId}`);
      if (!professorPageResponse.ok) throw new Error(`HTTP error! status: ${professorPageResponse.status}`);

      const ratingData = await professorPageResponse.json();
      const rating = ratingData.rating;

      outputDiv.textContent = `Rating for ${professorName}: ${rating}`;
  } catch (error) {
      outputDiv.textContent = "Error retrieving rating. Please try again.";
  }
});
