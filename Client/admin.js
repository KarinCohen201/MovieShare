document.addEventListener("DOMContentLoaded", async () => {
    const email = sessionStorage.getItem("userEmail");
    if (!email) {
        alert("Please log in first!");
        window.location.href = "/login";
        return;
    }

    try {
        console.log("Checking if user is an admin...");
        const isAdmin = await checkIfAdmin(email);
        if (!isAdmin) {
            alert("Access Denied: Admins only.");
            window.location.href = "/index";
            return;
        }
        console.log("User is an admin.");
       
        await loadPublicLinks();

    } catch (error) {
        console.error("Error loading admin panel:", error);
    }

    document.getElementById("logout-button").addEventListener("click", async () => {
        await fetch("/logout", { method: "POST" });
        sessionStorage.clear();
        window.location.href = "/login";
    });

    document.getElementById("back-to-index").addEventListener("click", () => {
        window.location.href = "/index"; 
    });
});


async function checkIfAdmin(email) {
    console.log("Checking admin status for:", email);
    try {
        const response = await fetch("/admin/check-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }) 
        });

        if (!response.ok) return false;
        const data = await response.json();
        return data.isAdmin;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

async function loadPublicLinks() {
    const email = sessionStorage.getItem("userEmail");
    if (!email) {
        alert("User email not found. Please log in again.");
        window.location.href = "/login";
        return;
    }

    try {
        const response = await fetch("/admin/public-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: sessionStorage.getItem("userEmail") })
        });

        if (!response.ok) throw new Error("Failed to fetch public links");

        const publicLinks = await response.json();
        console.log("Fetched Public Links:", publicLinks);

        const tableBody = document.getElementById("public-links-table-body");
        tableBody.innerHTML = ""; 

        if (publicLinks.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No public links found.</td></tr>`;
            return;
        }

        publicLinks.forEach(link => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${link.username}</td>
                <td>${link.urlName}</td>
                <td><a href="${link.url}" target="_blank">${link.url}</a></td>
                <td>${link.description}</td>
                <td>${link.averageRating ? link.averageRating.toFixed(1) : "No Rating"}</td>
                <td><button class="btn btn-danger btn-sm delete-link" data-id="${link._id}">Delete</button></td>
            `;

            tableBody.appendChild(row);
        });

        document.querySelectorAll(".delete-link").forEach(button => {
            button.addEventListener("click", async (event) => {
                const linkId = event.target.dataset.id;
                await deleteLink(linkId); 
            });
        });

    } catch (error) {
        return;
    }
}


async function deleteLink(linkId) {
    try {
        const confirmation = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (!confirmation.isConfirmed) return;

        const email = sessionStorage.getItem("userEmail"); 

        if (!email) {
            console.error("Error: Missing user email");
            Swal.fire("Error", "User email is missing. Please log in again.", "error");
            return;
        }

        const response = await fetch("/admin/delete-link", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linkId, email }) 
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.error || "Unknown error occurred");
        }

        Swal.fire("Deleted!", "The link has been removed.", "success");
        await loadPublicLinks(); 

    } catch (error) {
        console.error("Error deleting link:", error);
        Swal.fire("Error", "Failed to delete the link.", "error");
    }
}
