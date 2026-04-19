// Google Login Response
function handleCredentialResponse(response) {
  console.log("Google Token:", response.credential);
  alert("Google Login Success");
}

// Contact Form Submit
document.getElementById("contactForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  const res = await fetch("/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.success) {
    alert("Message Sent ✅");
  } else {
    alert("Error ❌");
  }
});
