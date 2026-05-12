import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://192.168.56.103:5000";

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#0D1117",
    color: "#85B7EB",
    fontFamily: "monospace",
    padding: "20px",
  },
  header: {
    borderBottom: "1px solid #378ADD",
    paddingBottom: "15px",
    marginBottom: "30px",
  },
  title: {
    color: "#378ADD",
    fontSize: "24px",
    margin: 0,
  },
  subtitle: {
    color: "#5DCAA5",
    fontSize: "13px",
    margin: "5px 0 0 0",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    border: "1px solid #1D9E75",
    color: "#5DCAA5",
    marginLeft: "10px",
  },
  statsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A2332",
    border: "1px solid #378ADD",
    borderRadius: "8px",
    padding: "15px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#378ADD",
  },
  statLabel: {
    fontSize: "11px",
    color: "#85B7EB",
    marginTop: "5px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  card: {
    backgroundColor: "#1A2332",
    border: "1px solid #378ADD",
    borderRadius: "8px",
    padding: "20px",
  },
  cardTitle: {
    color: "#5DCAA5",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "15px",
    borderBottom: "1px solid #0F2318",
    paddingBottom: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    backgroundColor: "#0D1117",
    border: "1px solid #378ADD",
    borderRadius: "4px",
    padding: "8px 12px",
    color: "#85B7EB",
    fontFamily: "monospace",
    fontSize: "13px",
  },
  button: {
    backgroundColor: "#1D9E75",
    border: "none",
    borderRadius: "4px",
    padding: "10px",
    color: "#fff",
    fontFamily: "monospace",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  },
  th: {
    backgroundColor: "#0D1117",
    color: "#378ADD",
    padding: "8px",
    textAlign: "left",
    borderBottom: "1px solid #378ADD",
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #1A2332",
    color: "#85B7EB",
  },
  deleteBtn: {
    backgroundColor: "#A32D2D",
    border: "none",
    borderRadius: "3px",
    padding: "3px 8px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
  },
  empty: {
    textAlign: "center",
    color: "#534AB7",
    padding: "20px",
    fontSize: "13px",
  },
};

export default function App() {
  const [donnees, setDonnees]   = useState([]);
  const [status, setStatus]     = useState(null);
  const [form, setForm]         = useState({ nom: "", valeur: "", categorie: "" });
  const [message, setMessage]   = useState("");

  const fetchStatus = async () => {
    try {
      const r = await axios.get(`${API_URL}/api/status`);
      setStatus(r.data);
    } catch {
      setStatus(null);
    }
  };

  const fetchDonnees = async () => {
    try {
      const r = await axios.get(`${API_URL}/api/donnees`);
      setDonnees(r.data);
    } catch {
      setDonnees([]);
    }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.valeur || !form.categorie) {
      setMessage("Tous les champs sont requis");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/donnees`, form);
      setMessage("Donnee ajoutee avec succes");
      setForm({ nom: "", valeur: "", categorie: "" });
      fetchDonnees();
    } catch {
      setMessage("Erreur lors de l ajout");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/donnees/${id}`);
      fetchDonnees();
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    fetchDonnees();
    const interval = setInterval(() => {
      fetchStatus();
      fetchDonnees();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const total    = donnees.length;
  const cats     = [...new Set(donnees.map((d) => d.categorie))].length;
  const somme    = donnees.reduce((s, d) => s + parseFloat(d.valeur || 0), 0).toFixed(2);

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          Big Data Dashboard
          <span style={styles.badge}>
            {status ? "SYSTEME OPERATIONNEL" : "HORS LIGNE"}
          </span>
        </h1>
        <p style={styles.subtitle}>
          Infrastructure Virtualisee — Module Virtualisation 2025/2026
        </p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{total}</div>
          <div style={styles.statLabel}>TOTAL ENTREES</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{cats}</div>
          <div style={styles.statLabel}>CATEGORIES</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "#5DCAA5" }}>{somme}</div>
          <div style={styles.statLabel}>SOMME VALEURS</div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>+ Nouvelle Entree</div>
          {message && (
            <p style={{ color: "#5DCAA5", fontSize: "12px", margin: "0 0 10px" }}>
              {message}
            </p>
          )}
          <div style={styles.form}>
            <input
              style={styles.input}
              placeholder="ex: Temperature serveur"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="ex: 42.5"
              value={form.valeur}
              onChange={(e) => setForm({ ...form, valeur: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="ex: Monitoring"
              value={form.categorie}
              onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            />
            <button style={styles.button} onClick={handleSubmit}>
              Ajouter la donnee
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>+ Donnees enregistrees</div>
          {donnees.length === 0 ? (
            <div style={styles.empty}>
              Aucune donnee<br />Ajoutez votre premiere entree
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>NOM</th>
                  <th style={styles.th}>VALEUR</th>
                  <th style={styles.th}>CATEGORIE</th>
                  <th style={styles.th}>DATE</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {donnees.map((d) => (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.id}</td>
                    <td style={styles.td}>{d.nom}</td>
                    <td style={styles.td}>{d.valeur}</td>
                    <td style={styles.td}>{d.categorie}</td>
                    <td style={styles.td}>
                      {new Date(d.date_ajout).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(d.id)}
                      >
                        Suppr
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}