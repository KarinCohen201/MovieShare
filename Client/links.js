async function addLink() {
    const email = sessionStorage.getItem("userEmail");
    if (!email) {
      alert("Please log in first!");
      window.location.href = "/login";
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "Add New Link",
      html: `
            <input id="swal-link-name" class="swal2-input" placeholder="Enter link name">
            <input id="swal-link-url" class="swal2-input" placeholder="Enter link URL">
            <textarea id="swal-link-description" class="swal2-textarea" placeholder="Enter link description"></textarea>
            <select id="swal-link-type" class="swal2-select">
                <option value="private">Private</option>
                <option value="public">Public</option>
            </select>
        `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Link",
      preConfirm: () => {
        return {
          urlName: document.getElementById("swal-link-name").value.trim(),
          url: document.getElementById("swal-link-url").value.trim(),
          description: document
            .getElementById("swal-link-description")
            .value.trim(),
          linkType: document.getElementById("swal-link-type").value,
        };
      },
    });

    if (
      !formValues ||
      !formValues.urlName ||
      !formValues.url ||
      !formValues.description
    ) {
      Swal.fire("Error", "All fields are required!", "error");
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const imdbID = urlParams.get("imdbid");

      const username = sessionStorage.getItem("username");
      const token = sessionStorage.getItem("token");

      const response = await fetch(`/links/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imdbID,
          urlName: formValues.urlName,
          url: formValues.url,
          description: formValues.description,
          linkType: formValues.linkType,
        }),
      });

      if (response.status == 401 || response.status == 403) {
        sessionStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add link.");
      }

      renderLinksTable();

      Swal.fire("Success!", "The link has been added successfully.", "success");
    } catch (error) {
      console.error("Error adding link:", error);
      Swal.fire("Error", "Failed to add the link.", "error");
    }
  }

async function editLink(linkId, urlName, url, description, linkType) {
  const email = sessionStorage.getItem("userEmail");
  if (!email) {
    alert("Please log in first!");
    window.location.href = "/login";
    return;
  }

  const { value: formValues } = await Swal.fire({
    title: "Edit Link",
    html: `
            <input id="swal-link-name" class="swal2-input" placeholder="Enter link name" value="${urlName}">
            <input id="swal-link-url" class="swal2-input" placeholder="Enter link URL" value="${url}">
            <textarea id="swal-link-description" class="swal2-textarea" placeholder="Enter link description">${description}</textarea>
            <select id="swal-link-type" class="swal2-select">
                <option value="private" ${
                  linkType === "private" ? "selected" : ""
                }>Private</option>
                <option value="public" ${
                  linkType === "public" ? "selected" : ""
                }>Public</option>
            </select>
        `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Update Link",
    preConfirm: () => {
      return {
        linkId, 
        urlName: document.getElementById("swal-link-name").value.trim(),
        url: document.getElementById("swal-link-url").value.trim(),
        description: document
          .getElementById("swal-link-description")
          .value.trim(),
        linkType: document.getElementById("swal-link-type").value,
      };
    },
  });

  if (
    !formValues ||
    !formValues.urlName ||
    !formValues.url ||
    !formValues.description
  ) {
    Swal.fire("Error", "All fields are required!", "error");
    return;
  }

  try {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`/links`, {
      method: "PUT",
      headers: { "Content-Type": "application/json",  Authorization: `Bearer ${token}` },
      body: JSON.stringify(formValues),
    });

    if (!response.ok) {
      throw new Error("Failed to update link.");
    }

    renderLinksTable(); 

    Swal.fire("Success!", "The link has been updated successfully.", "success");
  } catch (error) {
    console.error("Error updating link:", error);
    Swal.fire("Error", "Failed to update the link.", "error");
  }
}

async function editLink(linkId, urlName, url, description, linkType) {
  const email = sessionStorage.getItem("userEmail");
  if (!email) {
    alert("Please log in first!");
    window.location.href = "/login";
    return;
  }


  const { value: formValues } = await Swal.fire({
    title: "Edit Link",
    html: `
            <input id="swal-link-name" class="swal2-input" placeholder="Enter link name" value="${urlName}">
            <input id="swal-link-url" class="swal2-input" placeholder="Enter link URL" value="${url}">
            <textarea id="swal-link-description" class="swal2-textarea" placeholder="Enter link description">${description}</textarea>
            <select id="swal-link-type" class="swal2-select">
                <option value="private" ${
                  linkType === "private" ? "selected" : ""
                }>Private</option>
                <option value="public" ${
                  linkType === "public" ? "selected" : ""
                }>Public</option>
            </select>
        `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Update Link",
    preConfirm: () => {
      return {
        linkId, 
        urlName: document.getElementById("swal-link-name").value.trim(),
        url: document.getElementById("swal-link-url").value.trim(),
        description: document
          .getElementById("swal-link-description")
          .value.trim(),
        linkType: document.getElementById("swal-link-type").value,
      };
    },
  });

  if (
    !formValues ||
    !formValues.urlName ||
    !formValues.url ||
    !formValues.description
  ) {
    Swal.fire("Error", "All fields are required!", "error");
    return;
  }

  try {
    const token = sessionStorage.getItem("token");
 

    const response = await fetch(`/links`, {
      method: "PUT",
      headers: { "Content-Type": "application/json",  Authorization: `Bearer ${token}` },
      body: JSON.stringify(formValues),
    });

    if (!response.ok) {
      throw new Error("Failed to update link.");
    }

    renderLinksTable(); 

    Swal.fire("Success!", "The link has been updated successfully.", "success");
  } catch (error) {
    console.error("Error updating link:", error);
    Swal.fire("Error", "Failed to update the link.", "error");
  }
}

async function deleteLink(linkId) {
  try {
    const token = sessionStorage.getItem("token");

    const response = await fetch("/links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json",   Authorization: `Bearer ${token}` },
      body: JSON.stringify({ linkId }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Link deleted successfully!");
      renderLinksTable();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error deleting link:", error);
  }
}
async function uploadLinks() {
    const email = sessionStorage.getItem("userEmail");
    if (!email) {
      alert("Please log in first!");
      window.location.href = "/login";
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "Add New Links",
      html: `
            <input type="file" id="excelFile" accept=".xlsx, .xls">
        `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Link",
    });
    const file = document.getElementById("excelFile").files[0];

    if (!file) {
      document.getElementById("uploadMessage").innerText =
        "Please select a file.";
      return;
    }

    const formData = new FormData();
    const urlParams = new URLSearchParams(window.location.search);
    const imdbID = urlParams.get("imdbid");

    const additionalData = {
      imdbID,
    };
    
    formData.append("file", file);
    formData.append("data", JSON.stringify(additionalData));
    try {
    const token = sessionStorage.getItem("token");

      const response = await fetch("/links/upload-links", {
        method: "POST",
        headers: {  Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add link.");
      }

      renderLinksTable();

      Swal.fire("Success!", "The link has been added successfully.", "success");
    } catch (error) {
      console.error("Error adding links:", error);
      Swal.fire("Error", "Failed to add the link.", "error");
    }
  }