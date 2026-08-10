# Notes de développement et pistes d’amélioration

Ce document présente les fonctionnalités réalisées dans le cadre du test, les travaux encore en cours et les améliorations qui auraient pu être ajoutées avec davantage de temps. L’objectif était de livrer en priorité une recherche d’offres complète et testée, sans élargir inutilement le périmètre.

## Réalisé

### Recherche d’offres

La recherche est exécutée par le backend et prend en charge des filtres combinables sur le titre, la localisation et le mode de travail. Le frontend synchronise les filtres appliqués avec l’URL, envoie les paramètres à l’API et représente explicitement les états de chargement, d’erreur, de résultats vides et de succès.

Les champs textuels sont soumis automatiquement avec un debounce afin de limiter les requêtes inutiles. Des tests backend et frontend couvrent notamment les filtres, leur combinaison, la construction des requêtes et les différents états de l’interface.

### Unification des objets `*_OPTIONS`

Les listes d’options associant une valeur métier à un label d’interface ont été centralisées. Les formulaires et l’affichage des résultats réutilisent désormais les mêmes objets `CONTRACT_TYPE_OPTIONS`, `STATUS_OPTIONS` et `WORK_MODE_OPTIONS`, ce qui évite les duplications et les divergences de libellés.

## En cours

### Tests end-to-end avec Playwright

Une suite Playwright est en cours d’ajout pour vérifier le parcours de recherche depuis le navigateur. La configuration, un premier scénario de recherche et un workflow GitHub Actions sont présents, mais ce chantier est encore considéré comme en cours tant que les scénarios ne sont pas stabilisés et validés dans l’environnement d’intégration continue.

## Améliorations envisagées

### Architecture et maintenabilité

- **Ajouter des alias d’import**, par exemple `@/` ou `@src/`, afin d’éviter les longs chemins relatifs et de rendre les déplacements de fichiers moins coûteux.
- **Faire évoluer l’architecture des fichiers** vers une organisation plus cohérente et adaptée à la croissance de l’application. Une organisation par domaine fonctionnel pourrait regrouper les composants, hooks, appels API, schémas et tests liés aux offres dans un même module, tout en conservant des dossiers partagés pour les briques réellement transverses.
- **Créer des sous-composants de formulaire intégrés à React Hook Form**, comme des champs texte, selects et messages d’erreur déjà connectés au contexte du formulaire. Cela réduirait le code répétitif tout en homogénéisant les labels, les erreurs et l’accessibilité.
- **Séparer la documentation détaillée de développement de `AGENTS.md`**. Ce dernier devrait rester compact et contenir uniquement les règles indispensables aux agents, tandis que l’architecture, les décisions techniques et les procédures détaillées seraient placées dans des documents dédiés.

### Récupération des données et gestion des états

- **Adopter TanStack Query** pour standardiser la récupération des données, le cache, l’annulation des requêtes, les retries et l’invalidation. Cela remplacerait progressivement la logique manuelle des hooks lorsque le nombre de ressources et de mutations le justifierait.
- **Utiliser des Error Boundaries et Suspense** pour définir des frontières cohérentes de chargement et d’erreur au niveau des routes ou des fonctionnalités. Cette évolution serait particulièrement pertinente avec une couche de récupération de données compatible avec Suspense.
- **Ajouter une pagination compatible avec les filtres**. La page courante et les filtres resteraient représentés dans l’URL et transmis ensemble au backend. L’API devrait également retourner les métadonnées nécessaires, comme le nombre total de résultats et de pages.

### Validation et sécurité des types

- **Ajouter Zod** pour valider les réponses API et partager des règles de validation explicites avec les formulaires frontend. Les données externes ne seraient ainsi plus considérées comme fiables sur la seule base des types TypeScript.
- **Mettre en place une chaîne de types end-to-end fondée sur OpenAPI**. Les schémas et la documentation Swagger pourraient devenir la source du client frontend généré, afin de limiter la duplication manuelle des types entre Phoenix et React.
- **Évaluer TanStack Router** pour bénéficier d’un routage fortement typé, notamment pour les paramètres de chemin et de recherche. Son intégration avec une bibliothèque de validation comme Zod, Valibot ou ArkType permettrait de valider les paramètres dès l’entrée d’une route. Cette migration ne serait pertinente que si son bénéfice compensait le coût de remplacement de React Router.

### Qualité, tooling et intégration continue

- **Ajouter un workflow GitHub Actions de qualité** exécutant au minimum le lint, le type-checking, les tests et le build frontend, ainsi que les vérifications backend pertinentes.
- **Évaluer le remplacement d’ESLint par Biome**, dont les performances et la configuration unifiée pour le lint et le formatage peuvent simplifier la chaîne d’outillage. Il faudrait d’abord vérifier que les règles actuellement utiles sont couvertes.
- **Finaliser l’exécution des tests Playwright en CI**, avec une base de données isolée, des données déterministes et des traces ou captures disponibles en cas d’échec.

### Internationalisation

- **Ajouter une solution d’i18n** afin d’extraire les textes de l’interface, gérer plusieurs langues et préparer les formats localisés. Cette évolution devrait inclure les messages de validation, les états d’erreur et les attributs d’accessibilité, pas uniquement les libellés visibles.

## Utilisation de l’IA

J’ai utilisé l’IA pour me repérer rapidement dans le projet, en particulier parce que je n’avais encore jamais utilisé Elixir, `asdf` et `mix`. J’ai notamment demandé une vue d’ensemble schématique de l’application afin d’identifier les principales couches, les routes et les endpoints déjà implémentés avant de commencer les modifications.

J’ai utilisé **Pi** comme AI harness, avec des workflows prédéfinis pour faciliter l’exploration du dépôt, la planification et les revues ciblées. Les propositions produites avec l’aide de l’IA ont été relues et adaptées au contexte du projet ; les commandes de vérification restent la source de vérité pour valider le comportement final.

## Ordre de priorité proposé

Avec davantage de temps, je prioriserais les améliorations ainsi :

1. stabiliser les tests Playwright et les exécuter en CI ;
2. ajouter la pagination en conservant les filtres dans l’URL ;
3. renforcer la validation des données et la sécurité des types ;
4. introduire TanStack Query si la surface de récupération des données continue de grandir ;
5. faire évoluer progressivement l’architecture et les composants de formulaire ;
6. évaluer ensuite les migrations plus structurantes, comme TanStack Router ou Biome.
