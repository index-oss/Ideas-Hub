import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ========== FIREBASE CONFIG ========== */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "ideas-hub-web-1dbcb.firebaseapp.com",
  projectId: "ideas-hub-web-1dbcb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ========== DOM ========== */
const projectsTbody = document.getElementById("projectsTbody");
const sharedTbody = document.getElementById("sharedTbody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

/* ========== TABS ========== */
yourProjectsTab.onclick = () => {
  yourProjectsTab.classList.add("active");
  sharedProjectsTab.classList.remove("active");
  yourProjectsSection.classList.remove("hidden");
  sharedProjectsSection.classList.add("hidden");
};

sharedProjectsTab.onclick = () => {
  sharedProjectsTab.classList.add("active");
  yourProjectsTab.classList.remove("active");
  sharedProjectsSection.classList.remove("hidden");
  yourProjectsSection.classList.add("hidden");
};

/* ========== PROJECTS STATE ========== */
let allProjects = [];

/* ========== LOAD PROJECTS ========== */
async function loadProjects() {
  projectsTbody.innerHTML = "";
  allProjects = [];

  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  snap.forEach(d => {
    allProjects.push({ id: d.id, ...d.data() });
  });

  renderProjects(allProjects);
}

/* ========== RENDER PROJECTS ========== */
function renderProjects(list) {
  projectsTbody.innerHTML = "";

  if (!list.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  let i = 1;
  list.forEach(p => {
    const desc =
      p.description.length > 80
        ? `
          ${p.description.slice(0, 80)}...
          <span class="read-more" onclick="showFull('${p.description.replace(/'/g, "\\'")}')">
            Read more
          </span>
        `
        : p.description;

    projectsTbody.innerHTML += `
      <tr>
        <td>${i++}</td>
        <td>${p.title}</td>
        <td class="desc">${desc}</td>
        <td>${p.category}</td>
        <td>
          ${p.link ? `<a href="${p.link}" target="_blank">Visit</a>` : "-"}
        </td>
        <td>
          <button onclick="pinProject('${p.id}', ${p.pinned})">
            ${p.pinned ? "Pinned" : "Pin"}
          </button>
        </td>
        <td>
          <button onclick="deleteProject('${p.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ========== READ MORE ========== */
window.showFull = text => {
  alert(text);
};

/* ========== SEARCH ========== */
searchInput.oninput = () => {
  const v = searchInput.value.toLowerCase();
  const filtered = allProjects.filter(p =>
    p.title.toLowerCase().includes(v) ||
    p.description.toLowerCase().includes(v)
  );
  renderProjects(filtered);
};

/* ========== ADD PROJECT ========== */
addProjectBtn.onclick = async () => {
  if (!projectTitle.value || !projectDesc.value) return;

  await addDoc(collection(db, "projects"), {
    title: projectTitle.value,
    description: projectDesc.value,
    category: projectCategory.value,
    link: projectLink.value,
    pinned: false,
    createdAt: new Date()
  });

  projectTitle.value = "";
  projectDesc.value = "";
  projectLink.value = "";

  loadProjects();
};

/* ========== PIN PROJECT ========== */
window.pinProject = async (id, pinned) => {
  await updateDoc(doc(db, "projects", id), {
    pinned: !pinned
  });
  loadProjects();
};

/* ========== DELETE PROJECT ========== */
window.deleteProject = async id => {
  if (!confirm("Delete this project?")) return;
  await deleteDoc(doc(db, "projects", id));
  loadProjects();
};

/* ========== SHARED PROJECTS ========== */
async function loadSharedProjects() {
  sharedTbody.innerHTML = "";
  const q = query(collection(db, "sharedProjects"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  let i = 1;
  snap.forEach(d => {
    const p = d.data();
    sharedTbody.innerHTML += `
      <tr>
        <td>${i++}</td>
        <td>${p.title}</td>
        <td>${p.description}</td>
        <td>${p.category}</td>
        <td>${p.submittedBy}</td>
        <td>
          <button onclick="deleteShared('${d.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ========== ADD SHARED PROJECT ========== */
submitSharedBtn.onclick = async () => {
  if (!sharedTitle.value || !sharedDesc.value) return;

  await addDoc(collection(db, "sharedProjects"), {
    title: sharedTitle.value,
    description: sharedDesc.value,
    category: sharedCategory.value,
    submittedBy: sharedBy.value || "-",
    createdAt: new Date()
  });

  sharedTitle.value = "";
  sharedDesc.value = "";
  sharedBy.value = "";

  loadSharedProjects();
};

/* ========== DELETE SHARED ========== */
window.deleteShared = async id => {
  if (!confirm("Delete this shared idea?")) return;
  await deleteDoc(doc(db, "sharedProjects", id));
  loadSharedProjects();
};

/* ========== INIT ========== */
loadProjects();
loadSharedProjects();