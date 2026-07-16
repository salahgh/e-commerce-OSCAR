# OSCAR Fashion — Panne et corrections du 16 juillet 2026

Résumé pour l'équipe. Tout ce qui est décrit ci-dessous est **déjà corrigé et en ligne**,
sauf la section « À faire ».

## Ce qui s'est passé

1. **Le site était en panne (erreur 502).** Le serveur avait redémarré automatiquement le
   15 juillet et les applications ne se relançaient pas toutes seules. C'est corrigé, et le
   redémarrage est maintenant automatique — cette panne ne se reproduira plus.

2. **Le catalogue était en désordre.** Beaucoup de produits à « 0 DZD », impossibles à acheter,
   des doublons (7 fois « arencia », 3 fois « lip gloss »…), un produit nommé « test » visible
   par les clients, et des liens qui ouvraient le mauvais produit. Cause : des bugs dans le
   back-office qui créaient des produits incomplets sans prévenir, et poussaient à recréer le
   même produit plusieurs fois.

## Ce qui a été corrigé

- **Nettoyage du catalogue** : 15 doublons supprimés (sauvegarde faite avant), 15 produits
  incomplets masqués de la boutique en attendant d'être terminés, adresses des produits (URL)
  réparées.
- **Back-office fiabilisé** :
  - Impossible désormais de créer un produit sans prix ou à moitié fait — en cas de problème,
    rien n'est enregistré et un message clair s'affiche.
  - Les produits incomplets apparaissent dans un **bandeau orange** en haut de la page
    Produits : cliquez dessus pour les terminer.
  - **« Ajouter existant » fonctionne enfin** : choisir « Taille » ou « Couleur » copie le
    groupe avec toutes ses options en un clic, au lieu d'échouer en silence.
- **Boutique** : les pages catégories affichaient de faux totaux (« 112 produits » au lieu
  de 9) et chargeaient très lentement en défilant. Corrigé : les vrais totaux s'affichent et
  le défilement charge 12 produits d'un coup.

## À faire par l'équipe

1. **Terminer les produits du bandeau orange** (page Produits) : ajouter variantes + prix,
   puis réactiver. « LIPSTICK » et « Ensemble Lv » ont déjà été faits ✔

*Une amélioration reste en attente de validation : empêcher la saisie d'un prix à 0 lors de la
modification d'un produit (c'est ce qui a permis le cas « old money »).*
