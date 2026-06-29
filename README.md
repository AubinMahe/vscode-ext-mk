# Extension 'mk'

Ce développement concerne une extension pour Visual Studio Code.

## Fonctions

Cette extension analyse les Makefiles présent dans les arborescences des projets de l'espace de travail à la recherche des différentes cibles `.PHONY:`.

Quand l'utilisateur clique *mk* dans la barre de statut un menu de type *QuickPick* est affiché.

## Comment la produire ?

Éditer le fichier package.json pour mettre à jour la version et lancer :

    $ vsce package
