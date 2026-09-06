# Livraison à domicile ou au bureau — questions pour finaliser la spécification

**Date :** 3 septembre 2026
**Destinataire :** propriétaire OSCAR Fashion
**Objet :** informations à réunir avant le développement de la double option de livraison

> **Mise à jour du 6 septembre 2026.** La double option de livraison est en ligne avec les hypothèses
> par défaut ci-dessous. Les tarifs « bureau » sont des valeurs provisoires (tarif domicile − 100 DA) ;
> les deux tarifs de chaque wilaya se modifient dans le back-office (Réglages → Livraison), sans
> intervention technique. Vos réponses ne changent donc plus le développement, seulement la grille.

## Ce que nous avons compris

- À la commande, le client choisit entre **livraison à domicile** et **livraison au bureau du transporteur le plus proche** (stop desk).
- Chaque mode a **son propre tarif dans chaque wilaya** (69 wilayas).
- Aujourd'hui le site propose un seul mode, « Livraison standard », à 500 DA quelle que soit la wilaya.

## Ce que nous proposons par défaut (à valider)

Si une question reste sans réponse, nous appliquerons l'hypothèse correspondante :

1. Le client choisit seulement le **mode** (domicile ou bureau). Il ne choisit pas un bureau précis : le transporteur livre au bureau le plus proche de sa commune.
2. Les prix sont gérés dans le **back-office** (page « Livraison » : tableau 69 wilayas × 2 prix, modifiable à tout moment sans intervention technique).
3. Les deux prix s'affichent dès que le client a choisi sa wilaya, avant qu'il ne choisisse le mode.
4. Un mode dont le prix est laissé vide pour une wilaya n'est pas proposé dans cette wilaya.
5. L'ancien mode « Livraison standard 500 DA » est retiré.
6. Mise en place sur le **site web d'abord**, puis dans l'application mobile.
7. Les prix sont en dinars, TTC, **par colis** (pas de calcul au poids).

## Questions

### 1. Transporteur et grille tarifaire

- 1.1 Quel(s) transporteur(s) utilisez-vous (Yalidine, ZR Express, Maystro, EMS, autre) ? Un seul pour toutes les wilayas, ou différents selon les wilayas ?
- 1.2 Merci de nous transmettre la **grille tarifaire officielle** (domicile et bureau, par wilaya), idéalement le fichier Excel du transporteur, ou de remplir le tableau en annexe.
- 1.3 Le tarif dépend-il uniquement de la wilaya, ou aussi de la commune (certains transporteurs facturent plus cher les communes éloignées) ?
- 1.4 Le tarif dépend-il du poids, du volume ou du nombre d'articles, ou est-ce un prix fixe par colis ?
- 1.5 Le nom du transporteur doit-il apparaître au client sur le site ?

### 2. Option « bureau »

- 2.1 Le client doit-il choisir un **bureau précis** (liste des bureaux par wilaya ou commune, avec adresse) ou seulement l'option « bureau le plus proche » ?
- 2.2 Si une liste est nécessaire : d'où viennent les bureaux (fichier du transporteur, API) et qui la met à jour ?
- 2.3 Y a-t-il des wilayas **sans bureau** (domicile uniquement) ou **sans livraison à domicile** ?
- 2.4 Y a-t-il des wilayas non desservies du tout ?

### 3. Gestion des prix

- 3.1 Qui modifie les prix et à quelle fréquence ?
- 3.2 Une page back-office avec le tableau (69 lignes × 2 prix) suffit-elle ? Souhaitez-vous aussi un import Excel/CSV ?
- 3.3 Faut-il conserver l'historique des changements de prix ?

### 4. Règles commerciales

- 4.1 Livraison **gratuite** à partir d'un certain montant ? Si oui, lequel, et pour les deux modes ?
- 4.2 Des codes promo peuvent-ils réduire les frais de livraison ?
- 4.3 Frais supplémentaires pour le **paiement à la livraison** ? Frais de retour en cas de refus du colis : facturés au client ?
- 4.4 Les prix communiqués sont-ils TTC ?
- 4.5 Prix différent pour une commande de plusieurs articles ?

### 5. Délais

- 5.1 Quels délais annoncer, par mode et par wilaya (ou par zone) ? Faut-il les afficher au client ?

### 6. Informations demandées au client

- 6.1 Le formulaire actuel demande nom, téléphone, wilaya et commune, mais **pas l'adresse de rue**. Pour la livraison à domicile, faut-il ajouter l'adresse exacte (rue, numéro, repère) ? Obligatoire ?
- 6.2 Pour la livraison au bureau, la commune suffit-elle ?
- 6.3 Le second numéro de téléphone est-il obligatoire ou facultatif ?

### 7. Parcours d'achat

- 7.1 Quel mode est sélectionné par défaut (domicile ?) ?
- 7.2 Afficher les deux prix dès le choix de la wilaya, avant le choix du mode ?
- 7.3 Publier la grille complète des tarifs sur la page « Livraison » du site ?
- 7.4 Textes exacts souhaités en français et en arabe pour les deux options, par exemple « Livraison à domicile » / « Livraison au bureau (stop desk) » et « التوصيل إلى المنزل » / « التوصيل إلى مكتب شركة التوصيل ».

### 8. Back-office et opérations

- 8.1 Le mode choisi doit-il apparaître sur la fiche commande, dans la liste des commandes (filtre) et dans les exports ?
- 8.2 Souhaitez-vous, maintenant ou plus tard, la connexion à l'**API du transporteur** (création automatique du colis, numéro de suivi) ?

### 9. Application mobile

- 9.1 La même fonctionnalité dans l'application mobile en même temps que le site, ou le site d'abord ?

### 10. Mise en production

- 10.1 Date souhaitée ?
- 10.2 Que faire des commandes en cours passées avec « Livraison standard » ? (Nous proposons : inchangées.)

## Annexe — grille tarifaire à compléter

Remplir les colonnes « Domicile (DA) » et « Bureau (DA) ». Laisser vide si le mode n'est pas proposé dans la wilaya. La colonne « Tarif indicatif » reprend les zones prévues au départ dans le projet ; elle n'a jamais été appliquée, le site facture aujourd'hui 500 DA partout.

| Code | Wilaya | الولاية | Zone actuelle | Tarif actuel (DA) | Domicile (DA) | Bureau (DA) | Bureau dispo ? |
|---|---|---|---|---|---|---|---|
| 01 | Adrar | أدرار | 4 | 800 |  |  |  |
| 02 | Chlef | الشلف | 2 | 400 |  |  |  |
| 03 | Laghouat | الأغواط | 3 | 500 |  |  |  |
| 04 | Oum El Bouaghi | أم البواقي | 3 | 500 |  |  |  |
| 05 | Batna | باتنة | 3 | 500 |  |  |  |
| 06 | Béjaïa | بجاية | 2 | 400 |  |  |  |
| 07 | Biskra | بسكرة | 3 | 500 |  |  |  |
| 08 | Béchar | بشار | 4 | 800 |  |  |  |
| 09 | Blida | البليدة | 1 | 300 |  |  |  |
| 10 | Bouira | البويرة | 3 | 500 |  |  |  |
| 11 | Tamanrasset | تمنراست | 4 | 800 |  |  |  |
| 12 | Tébessa | تبسة | 3 | 500 |  |  |  |
| 13 | Tlemcen | تلمسان | 2 | 400 |  |  |  |
| 14 | Tiaret | تيارت | 3 | 500 |  |  |  |
| 15 | Tizi Ouzou | تيزي وزو | 2 | 400 |  |  |  |
| 16 | Alger | الجزائر | 1 | 300 |  |  |  |
| 17 | Djelfa | الجلفة | 3 | 500 |  |  |  |
| 18 | Jijel | جيجل | 2 | 400 |  |  |  |
| 19 | Sétif | سطيف | 3 | 500 |  |  |  |
| 20 | Saïda | سعيدة | 3 | 500 |  |  |  |
| 21 | Skikda | سكيكدة | 2 | 400 |  |  |  |
| 22 | Sidi Bel Abbès | سيدي بلعباس | 2 | 400 |  |  |  |
| 23 | Annaba | عنابة | 2 | 400 |  |  |  |
| 24 | Guelma | قالمة | 2 | 400 |  |  |  |
| 25 | Constantine | قسنطينة | 2 | 400 |  |  |  |
| 26 | Médéa | المدية | 3 | 500 |  |  |  |
| 27 | Mostaganem | مستغانم | 2 | 400 |  |  |  |
| 28 | M'Sila | المسيلة | 3 | 500 |  |  |  |
| 29 | Mascara | معسكر | 2 | 400 |  |  |  |
| 30 | Ouargla | ورقلة | 4 | 800 |  |  |  |
| 31 | Oran | وهران | 2 | 400 |  |  |  |
| 32 | El Bayadh | البيض | 4 | 800 |  |  |  |
| 33 | Illizi | إليزي | 4 | 800 |  |  |  |
| 34 | Bordj Bou Arreridj | برج بوعريريج | 3 | 500 |  |  |  |
| 35 | Boumerdès | بومرداس | 1 | 300 |  |  |  |
| 36 | El Tarf | الطارف | 2 | 400 |  |  |  |
| 37 | Tindouf | تندوف | 4 | 800 |  |  |  |
| 38 | Tissemsilt | تيسمسيلت | 3 | 500 |  |  |  |
| 39 | El Oued | الوادي | 4 | 800 |  |  |  |
| 40 | Khenchela | خنشلة | 3 | 500 |  |  |  |
| 41 | Souk Ahras | سوق أهراس | 3 | 500 |  |  |  |
| 42 | Tipaza | تيبازة | 1 | 300 |  |  |  |
| 43 | Mila | ميلة | 3 | 500 |  |  |  |
| 44 | Aïn Defla | عين الدفلة | 3 | 500 |  |  |  |
| 45 | Naâma | النعامة | 4 | 800 |  |  |  |
| 46 | Aïn Témouchent | عين تيموشنت | 2 | 400 |  |  |  |
| 47 | Ghardaïa | غرداية | 4 | 800 |  |  |  |
| 48 | Relizane | غليزان | 2 | 400 |  |  |  |
| 49 | Timimoun | تيميمون | 4 | 800 |  |  |  |
| 50 | Bordj Badji Mokhtar | برج باجي مختار | 4 | 800 |  |  |  |
| 51 | Ouled Djellal | أولاد جلال | 3 | 500 |  |  |  |
| 52 | Béni Abbès | بني عباس | 4 | 800 |  |  |  |
| 53 | In Salah | عين صالح | 4 | 800 |  |  |  |
| 54 | In Guezzam | عين قزام | 4 | 800 |  |  |  |
| 55 | Touggourt | تقرت | 4 | 800 |  |  |  |
| 56 | Djanet | جانت | 4 | 800 |  |  |  |
| 57 | El Meghaier | المغير | 4 | 800 |  |  |  |
| 58 | El Menia | المنيعة | 4 | 800 |  |  |  |
| 59 | Aflou | أفلو | 3 | 500 |  |  |  |
| 60 | Barika | بريكة | 3 | 500 |  |  |  |
| 61 | Ksar Chellala | قصر الشلالة | 3 | 500 |  |  |  |
| 62 | Messaad | مسعد | 3 | 500 |  |  |  |
| 63 | Aïn Oussera | عين وسارة | 3 | 500 |  |  |  |
| 64 | Boussaâda | بوسعادة | 3 | 500 |  |  |  |
| 65 | El Abiodh Sidi Cheikh | الأبيض سيدي الشيخ | 4 | 800 |  |  |  |
| 66 | El Kantara | القنطرة | 3 | 500 |  |  |  |
| 67 | Bir El Ater | بئر العاتر | 3 | 500 |  |  |  |
| 68 | Ksar El Boukhari | قصر البخاري | 3 | 500 |  |  |  |
| 69 | El Aricha | العريشة | 3 | 500 |  |  |  |
