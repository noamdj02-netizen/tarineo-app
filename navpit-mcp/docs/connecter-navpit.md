# Connecter Navpit à tes agents IA

Navpit est un serveur MCP. Ton agent peut lire ton Focus, tes projets et tes tâches,
créer des tâches et importer des notes (Obsidian, comptes rendus...).

## 1. Crée ta clé

Navpit → **Compte** → **Connecter tes agents IA** → **Créer une clé**.
Copie-la tout de suite : elle ne s'affiche qu'une fois.

Décoche "Autoriser la modification" si tu veux que l'agent lise seulement.

## 2. Branche ton outil

### Claude Code
```bash
claude mcp add --transport http navpit https://navpit.com/api/mcp --header "Authorization: Bearer TA_CLE"
```

### Cursor
Dans `~/.cursor/mcp.json` :
```json
{
  "mcpServers": {
    "navpit": {
      "url": "https://navpit.com/api/mcp",
      "headers": { "Authorization": "Bearer TA_CLE" }
    }
  }
}
```

### Claude Desktop
Dans `claude_desktop_config.json` (Réglages → Développeur → Modifier la config) :
```json
{
  "mcpServers": {
    "navpit": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://navpit.com/api/mcp", "--header", "Authorization:${NAVPIT_AUTH}"],
      "env": { "NAVPIT_AUTH": "Bearer TA_CLE" }
    }
  }
}
```

### Tes propres agents
Endpoint Streamable HTTP : `https://navpit.com/api/mcp`
Header : `Authorization: Bearer TA_CLE`

## 3. Avec Obsidian

Si ton agent est déjà relié à ton vault Obsidian, il fait le pont tout seul. Exemples de demandes :

- « Lis mes notes Obsidian du dossier Projets/Client X et crée les tâches dans mon projet Navpit. »
- « Résume ma note "Réunion lundi" et ajoute-la au projet en Focus sur Navpit. »
- « Qu'est-ce qui reste à faire sur mon Focus Navpit ? Croise avec mes notes Obsidian de la semaine. »

## Ce que l'agent peut faire

| Outil | Accès | Rôle |
|---|---|---|
| get_focus | lecture | Projet en Focus + tâches ouvertes |
| list_projects | lecture | Tous tes projets |
| get_project | lecture | Un projet et ses tâches |
| list_tasks | lecture | Tâches d'un projet |
| search_notes | lecture | Recherche dans tes notes |
| create_project | écriture | Crée un projet (jamais en Focus) |
| create_task | écriture | Ajoute une tâche |
| update_task | écriture | Modifie ou coche une tâche |
| add_note | écriture | Ajoute une note markdown |

L'agent ne peut ni supprimer un projet, ni changer ton Focus.

## Sécurité
- Une clé par appareil ou par agent, avec un nom clair.
- Clé perdue ou partagée par erreur → **Révoquer** dans Compte, puis en recréer une.
