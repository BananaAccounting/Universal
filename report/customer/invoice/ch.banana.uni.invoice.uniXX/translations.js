/* Translations update: 2022-06-07 */


function setTexts(language) {

  /*
    Defines all the texts translations for all the different languages.
  */

  var texts = {};

  if (language === 'it') {
    setTexts_IT(texts);
  }
  else if (language === 'de') {
    setTexts_DE(texts);
  }
  else if (language === 'fr') {
    setTexts_FR(texts);
  }
  else if (language === 'nl') {
    setTexts_NL(texts);
  }
  else if (language === 'zh') {
    setTexts_ZH(texts);
  }
  else {
    setTexts_EN(texts);
  }

  return texts;
}

function setTexts_IT(texts) {
  texts.phone = "Tel";
  texts.shipping_address = "Indirizzo spedizione";
  texts.invoice = "Fattura";
  texts.date = "Data";
  texts.order_number = "No ordine";
  texts.order_date = "Data ordine";
  texts.customer = "No cliente";
  texts.vat_number = "No IVA";
  texts.fiscal_number = "No fiscale";
  texts.payment_due_date_label = "Scadenza";
  texts.payment_terms_label = "Scadenza";
  texts.page = "Pagina";
  texts.credit_note = "Nota di credito";
  texts.description = "Descrizione";
  texts.quantity = "Quantità";
  texts.reference_unit = "Unità";
  texts.unit_price = "Prezzo Unità";
  texts.amount = "Importo";
  texts.discount = "Sconto";
  texts.deposit = "Acconto";
  texts.totalnet = "Totale netto";
  texts.subtotal = "Sottototale";
  texts.vat = "IVA";
  texts.rounding = "Arrotondamento";
  texts.total = "TOTALE";
  texts.include = "Stampa";
  texts.header_include = "Intestazione";
  texts.header_print = "Intestazione pagina";
  texts.header_row_1 = "Testo riga 1";
  texts.header_row_2 = "Testo riga 2";
  texts.header_row_3 = "Testo riga 3";
  texts.header_row_4 = "Testo riga 4";
  texts.header_row_5 = "Testo riga 5";
  texts.logo_print = "Logo";
  texts.logo_name = "Nome personalizzazione logo";
  texts.address_include = "Indirizzo cliente";
  texts.address_small_line = "Testo indirizzo mittente";
  texts.address_left = "Allinea a sinistra";
  texts.address_composition = "Composizione indirizzo";
  texts.address_position_dX = 'Sposta orizzontalmente +/- (in cm, default 0)';
  texts.address_position_dY = 'Sposta verticalmente +/- (in cm, default 0)';
  texts.shipping_address = "Indirizzo spedizione";
  texts.info_include = "Informazioni";
  texts.info_invoice_number = "Numero fattura";
  texts.info_date = "Data fattura";
  texts.info_order_number = "Numero ordine";
  texts.info_order_date = "Data ordine";
  texts.info_customer = "Numero cliente";
  texts.info_customer_vat_number = "Numero IVA cliente";
  texts.info_customer_fiscal_number = "Numero fiscale cliente";
  texts.info_due_date = "Scadenza fattura";
  texts.info_page = "Numero pagina";
  texts.info_custom_fields = "Campi personalizzati";
  texts.details_include = "Dettagli fattura";
  texts.details_columns = "Nomi colonne";
  texts.details_columns_widths = "Larghezza colonne";
  texts.details_columns_titles_alignment = "Allineamento titoli";
  texts.details_columns_alignment = "Allineamento testi";
  texts.details_gross_amounts = "Importi lordi (IVA inclusa)";
  texts.details_additional_descriptions = "Stampa descrizioni supplementari";
  texts.footer = "Piè di pagina";
  texts.footer_add = "Stampa piè di pagina";
  texts.footer_horizontal_line = "Stampa bordo di separazione"
  texts.texts = "Testi (vuoto = valori predefiniti)";
  texts.languages = "Lingue";
  texts.languages_remove = "Desideri rimuovere '<removedLanguages>' dalla lista delle lingue?";
  texts.it_param_text_info_invoice_number = "Numero fattura";
  texts.it_param_text_info_date = "Data fattura";
  texts.it_param_text_info_order_number = "Numero ordine";
  texts.it_param_text_info_order_date = "Data ordine";
  texts.it_param_text_info_customer = "Numero cliente";
  texts.it_param_text_info_customer_vat_number = "Numero IVA cliente";
  texts.it_param_text_info_customer_fiscal_number = "Numero fiscale cliente";
  texts.it_param_text_info_due_date = "Scadenza fattura";
  texts.it_param_text_info_page = "Numero pagina";
  texts.it_param_text_shipping_address = "Indirizzo spedizione";
  texts.it_param_text_title_doctype_10 = "Titolo fattura";
  texts.it_param_text_title_doctype_12 = "Titolo nota di credito";
  texts.it_param_text_begin = "Testo iniziale";
  texts.it_param_text_details_columns = "Nomi colonne dettagli fattura";
  texts.it_param_text_totalnet = "Totale netto fattura";
  texts.it_param_text_vat = "IVA fattura";
  texts.it_param_text_total = "Totale fattura";
  texts.it_param_text_final = "Testo finale";
  texts.it_param_footer_left = "Piè di pagina testo sinistra";
  texts.it_param_footer_center = "Piè di pagina testo centro";
  texts.it_param_footer_right = "Piè di pagina testo destra";
  texts.styles = "Stili";
  // texts.color_text = "Colore testo";
  // texts.color_background_details_header = "Colore sfondo intestazione dettagli";
  // texts.color_details_header_text = "Colore testo intestazione dettagli";
  // texts.color_background_alternate_lines = "Colore sfondo per righe alternate";
  texts.font_family = "Tipo carattere";
  texts.font_size = "Dimensione carattere";
  texts.embedded_javascript_file_not_found = "File JavaScript non trovato o non valido";
  texts.embedded_javascript = "JavaScript / CSS";
  texts.embedded_javascript_filename = "Nome file JS (colonna 'ID' tabella Documenti)";
  texts.embedded_css_filename = "Nome file CSS (colonna 'ID' tabella Documenti)";
  texts.error1 = "I nomi delle colonne non corrispondono ai testi da stampare. Verificare impostazioni fattura.";
  texts.it_error1_msg = "Nomi testi e colonne non corrispondono";
  

  texts.offer = "Offerta";
  texts.it_param_text_info_offer_number = "Numero offerta";
  texts.it_param_text_info_date_offer = "Data offerta";
  texts.it_param_text_info_validity_date_offer = "Validità offerta";
  texts.validity_terms_label = "Validità";
  texts.it_param_text_title_doctype_17 = "Titolo offerta";
  texts.it_param_text_begin_offer = "Testo iniziale offerta";
  texts.it_param_text_final_offer = "Testo finale offerta";

  texts.details_columns_predefined = "Colonne predefinite";
  texts.predefined_columns_0 = "- Seleziona -";
  texts.predefined_columns_1 = "Descrizione,Importo";
  texts.predefined_columns_2 = "Descrizione,Quantità,Unità,Prezzo Unità,Importo";
  texts.predefined_columns_3 = "Articolo,Descrizione,Importo";
  texts.predefined_columns_4 = "Articolo,Descrizione,Quantità,Unità,Prezzo Unità,Importo";
  texts.predefined_columns_5 = "Immagine articolo,Articolo,Descrizione,Quantità,Unità,Prezzo Unità,Importo (ADVANCED)";
  texts.predefined_columns_6 = "Descrizione,Sconto,Importo (ADVANCED)";
  texts.predefined_columns_7 = "Descrizione,Quantità,Unità,Prezzo Unità,Sconto,Importo (ADVANCED)";
  texts.predefined_columns_8 = "Articolo,Data,Descrizione,Quantità,Unit,Unit Price,Sconto,Importo (ADVANCED)";
  texts.style_change_confirm_title = "Colonne predefinite";
  texts.style_change_confirm_msg = "Applicare le colonne '%1'?\nLe attuali impostazioni delle colonne saranno sostituite.";



  // novità..

  texts.header_address_from_accounting = "Usa indirizzo contabilità";

  texts.colors = "Colori";
  // texts.use_color_theme = "Utilizza tema colore predefinito";
  texts.color_theme = "Tema";
  texts.color_theme_custom = "Colore base";


  // texts.themecolor1 = "1. Nero";
  // texts.themecolor2 = "2. Banana";
  // texts.themecolor3 = "3. Rosso";
  // texts.themecolor4 = "4. Rosa";
  // texts.themecolor5 = "5. Viola";
  // texts.themecolor6 = "6. Indaco
  // texts.themecolor7 = "7. Blu";
  // texts.themecolor8 = "8. Azzurro";
  // texts.themecolor9 = "9. Verde acqua";
  // texts.themecolor10 = "10. Verde";
  // texts.themecolor11 = "11. Arancione";
  // texts.themecolor12 = "12. Marrone";
  // texts.themecolor13 = "13. Grigio blu";
  // texts.themecolor14 = "14. Verde turchese";
  // texts.themecolor15 = "15. Verde mare";
  // texts.themecolorcustom = "Personale";


  /*
    nero
    banana
    blu
    verde
    arancione
    rosso
    verde acqua
    viola
    azzurro
    indaco
    rosa
    marrone
    verde turchese
    blu-grigio
    verde mare
  */

  texts.themecolor1 = "Nero";
  texts.themecolor2 = "Blu";
  texts.themecolor3 = "Verde";
  texts.themecolor4 = "Arancione";
  texts.themecolor5 = "Rosso";
  texts.themecolor6 = "Verde acqua";
  texts.themecolor7 = "Viola";
  texts.themecolor8 = "Azzurro";
  texts.themecolor9 = "Indaco";
  texts.themecolor10 = "Rosa";
  texts.themecolor11 = "Marrone";
  texts.themecolor12 = "Verde turchese";
  texts.themecolor13 = "Grigio blu";
  texts.themecolor14 = "Verde mare";
  texts.themecolorcustom = "Personale";



  // texts.themecolorcustommodified = "Personale - modificato";
  texts.color_header_text = "Intestazione";
  texts.color_label_text = "Labels";
  texts.color_title_text = "Titolo";
  texts.color_background_details_header = "Sfondo intestazione tabella";
  texts.color_details_header_text = "Testo intestazione tabella";
  texts.color_background_alternate_lines = "Righe alternate tabella";
  texts.color_lines = "Linee";
  texts.color_total_text = "Totale";
  texts.color_text = "Testo";



  texts.it_param_text_payment = "Testo pagamento";


  texts.css_code = "Codice CSS";

}

function setTexts_DE(texts) {
  texts.phone = "Tel.";
  texts.shipping_address = "Lieferadresse";
  texts.invoice = "Rechnung";
  texts.date = "Datum";
  texts.order_number = "Bestellnummer";
  texts.order_date = "Bestelldatum";
  texts.customer = "Kundennummer";
  texts.vat_number = "MwSt/USt-Nummer";
  texts.fiscal_number = "Steuernummer";
  texts.payment_due_date_label = "Fälligkeitsdatum";
  texts.payment_terms_label = "Fälligkeitsdatum";
  texts.page = "Seite";
  texts.credit_note = "Gutschrift";
  texts.description = "Beschreibung";
  texts.quantity = "Menge";
  texts.reference_unit = "Einheit";
  texts.unit_price = "Preiseinheit";
  texts.amount = "Betrag";
  texts.discount = "Rabatt";
  texts.deposit = "Anzahlung";
  texts.totalnet = "Netto-Betrag";
  texts.subtotal = "Zwischentotal";
  texts.vat = "MwSt/USt";
  texts.rounding = "Rundung";
  texts.total = "Gesamtbetrag";
  texts.include = "Drucken";
  texts.header_include = "Kopfzeile";
  texts.header_print = "Seitenkopf drucken";
  texts.header_row_1 = "Kopfzeilentext 1";
  texts.header_row_2 = "Kopfzeilentext 2";
  texts.header_row_3 = "Kopfzeilentext 3";
  texts.header_row_4 = "Kopfzeilentext 4";
  texts.header_row_5 = "Kopfzeilentext 5";
  texts.logo_print = "Logo";
  texts.logo_name = "Name der Logoanpassung";
  texts.address_include = "Kundenadresse";
  texts.address_small_line = "Absenderadresse";
  texts.address_left = "Adresse linksbündig";
  texts.address_composition = "Zusammensetzung der Adresse";
  texts.address_position_dX = 'Horizontal verschieben +/- (in cm, Voreinstellung 0)';
  texts.address_position_dY = 'Vertikal verschieben +/- (in cm, Voreinstellung 0)';
  texts.shipping_address = "Lieferadresse";
  texts.info_include = "Info";
  texts.info_invoice_number = "Rechnungsnummer";
  texts.info_date = "Rechnungsdatum";
  texts.info_order_number = "Bestellnummer";
  texts.info_order_date = "Bestelldatum";
  texts.info_customer = "Kundennummer";
  texts.info_customer_vat_number = "Kunden-MwSt/USt-Nummer";
  texts.info_customer_fiscal_number = "Kunden-Steuernummer";
  texts.info_due_date = "Fälligkeitsdatum";
  texts.info_page = "Seitenzahlen";
  texts.info_custom_fields = "Benutzerdefinierte Felder";
  texts.details_include = "Rechnungsdetails einschliessen";
  texts.details_columns = "Spaltennamen";
  texts.details_columns_widths = "Spaltenbreite";
  texts.details_columns_titles_alignment = "Titelausrichtung";
  texts.details_columns_alignment = "Textausrichtung";
  texts.details_gross_amounts = "Bruttobeträge (inklusive MwSt/USt)";
  texts.details_additional_descriptions = "Zusätzliche Beschreibungen drucken";
  texts.footer = "Fusszeile";
  texts.footer_add = "Fusszeile drucken";
  texts.footer_horizontal_line = "Trennlinie drucken";
  texts.texts = "Texte (leer = Standardwerte)";
  texts.languages = "Sprachen";
  texts.languages_remove = "Möchten Sie '<removedLanguages>' aus der Liste der Sprachen streichen?";
  texts.de_param_text_info_invoice_number = "Rechnungsnummer";
  texts.de_param_text_info_date = "Rechnungsdatum";
  texts.de_param_text_info_order_number = "Bestellnummer";
  texts.de_param_text_info_order_date = "Bestelldatum";
  texts.de_param_text_info_customer = "Kundennummer";
  texts.de_param_text_info_customer_vat_number = "Kunden-MwSt/USt-Nummer";
  texts.de_param_text_info_customer_fiscal_number = "Kunden-Steuernummer";
  texts.de_param_text_info_due_date = "Fälligkeitsdatum";
  texts.de_param_text_info_page = "Seitennummer";
  texts.de_param_text_shipping_address = "Lieferadresse";
  texts.de_param_text_title_doctype_10 = "Rechnungstitel";
  texts.de_param_text_title_doctype_12 = "Gutschriftstitel";
  texts.de_param_text_begin = "Anfangstext";
  texts.de_param_text_details_columns = "Spaltennamen Rechnungsdetails";
  texts.de_param_text_totalnet = "Netto-Betrag";
  texts.de_param_text_vat = "MwSt/USt";
  texts.de_param_text_total = "Rechnungsbetrag";
  texts.de_param_text_final = "Text am Ende";
  texts.de_param_footer_left = "Fusszeilentext links";
  texts.de_param_footer_center = "Fusszeilentext zentriert";
  texts.de_param_footer_right = "Fusszeilentext rechts";
  texts.styles = "Schriftarten";
  texts.color_text = "Textfarbe";
  texts.color_background_details_header = "Hintergrundfarbe Details-Kopfzeilen";
  texts.color_details_header_text = "Farbtext Details-Kopfzeilen";
  texts.color_background_alternate_lines = "Hintergrundfarbe alternativer Zeilen";
  texts.font_family = "Schriftzeichen";
  texts.font_size = "Schriftgrösse";
  texts.embedded_javascript_file_not_found = "Benutzerdefinierte Javascript-Datei nicht gefunden oder nicht gültig";
  texts.embedded_javascript = "JavaScript / CSS";
  texts.embedded_javascript_filename = "JS Dateiname ('ID-Spalte Dokumente-Tabelle)";
  texts.embedded_css_filename = "CSS Dateiname ('ID-Spalte Dokumente-Tabelle)";

  texts.error1 = "Die Spaltennamen stimmen nicht mit den zu druckenden Texten überein. Prüfen Sie die Rechnungseinstellungen.";
  texts.de_error1_msg = "Die Namen von Text und Spalten stimmen nicht überein.";

  texts.offer = "Offerte";
  texts.de_param_text_info_offer_number = "Offerte Nr.";
  texts.de_param_text_info_date_offer = "Datum Offerte";
  texts.de_param_text_info_validity_date_offer = "Gültigkeit Offerte";
  texts.validity_terms_label = "Gültigkeit";
  texts.de_param_text_title_doctype_17 = "Titel Offerte";
  texts.de_param_text_begin_offer = "Anfangstext Offerte";
  texts.de_param_text_final_offer = "Schlusstext Offerte";

  texts.details_columns_predefined = "Vordefinierte Spalten";
  texts.predefined_columns_0 = "- Auswählen -";
  texts.predefined_columns_1 = "Beschreibung,Betrag";
  texts.predefined_columns_2 = "Beschreibung,Menge,Einheit,Preiseinheit,Betrag";
  texts.predefined_columns_3 = "Artikel,Beschreibung,Betrag";
  texts.predefined_columns_4 = "Artikel,Beschreibung,Menge,Einheit,Preiseinheit,Betrag";
  texts.predefined_columns_5 = "Produktbild,Artikel,Beschreibung,Menge,Einheit,Preiseinheit,Betrag (ADVANCED)";
  texts.predefined_columns_6 = "Beschreibung,Rabatt,Betrag (ADVANCED)";
  texts.predefined_columns_7 = "Beschreibung,Menge,Einheit,Preiseinheit,Rabatt,Betrag (ADVANCED)";
  texts.predefined_columns_8 = "Artikel,Datum,Beschreibung,Menge,Einheit,Preiseinheit,Rabatt,Betrag (ADVANCED)";
  texts.style_change_confirm_title = "Vordefinierte Spalten";
  texts.style_change_confirm_msg = "'%1' Spalten anwenden?\nDie aktuellen Spalteneinstellungen werden ersetzt.";
}

function setTexts_FR(texts) {
  texts.phone = "Tél.";
  texts.shipping_address = "Adresse de livraison";
  texts.invoice = "Facture";
  texts.date = "Date";
  texts.order_number = "Numéro de commande";
  texts.order_date = "Date de commande";
  texts.customer = "Numéro Client";
  texts.vat_number = "Numéro de TVA";
  texts.fiscal_number = "Numéro fiscal";
  texts.payment_due_date_label = "Échéance";
  texts.payment_terms_label = "Échéance";
  texts.page = "Page";
  texts.credit_note = "Note de crédit";
  texts.description = "Description";
  texts.quantity = "Quantité";
  texts.reference_unit = "Unité";
  texts.unit_price = "Prix Unitaire";
  texts.amount = "Montant";
  texts.discount = "Rabais";
  texts.deposit = "Acompte";
  texts.totalnet = "Total net";
  texts.subtotal = "Sous-total";
  texts.vat = "TVA";
  texts.rounding = "Arrondi";
  texts.total = "TOTAL";
  texts.include = "Imprimer";
  texts.header_include = "En-tête";
  texts.header_print = "En-tête de page";
  texts.header_row_1 = "Texte ligne 1";
  texts.header_row_2 = "Texte ligne 2";
  texts.header_row_3 = "Texte ligne 3";
  texts.header_row_4 = "Texte ligne 4";
  texts.header_row_5 = "Texte ligne 5";
  texts.logo_print = "Logo";
  texts.logo_name = "Nom de la personnalisation du logo";
  texts.address_include = "Adresse client";
  texts.address_small_line = "Texte adresse de l'expéditeur";
  texts.address_left = "Aligner à gauche";
  texts.address_composition = "Composition de l'adresse";
  texts.address_position_dX = 'Déplacer horizontalement +/- (en cm, défaut 0)';
  texts.address_position_dY = 'Déplacer verticalement +/- (en cm, défaut 0)';
  texts.shipping_address = "Adresse de livraison";
  texts.info_include = "Informations";
  texts.info_invoice_number = "Numéro de facture";
  texts.info_date = "Date facture";
  texts.info_order_number = "Numéro de commande";
  texts.info_order_date = "Date de commande";
  texts.info_customer = "Numéro Client";
  texts.info_customer_vat_number = "Numéro de TVA client";
  texts.info_customer_fiscal_number = "Numéro fiscal client";
  texts.info_due_date = "Échéance facture";
  texts.info_page = "Numéro de page";
  texts.info_custom_fields = "Champs personnalisés";
  texts.details_include = "Détails de la facture";
  texts.details_columns = "Noms des colonnes";
  texts.details_columns_widths = "Largeur des colonnes";
  texts.details_columns_titles_alignment = "Alignement des titres";
  texts.details_columns_alignment = "Alignement des textes";
  texts.details_gross_amounts = "Montants bruts (TVA incluse)";
  texts.details_additional_descriptions = "Imprimer des descriptions supplémentaires";
  texts.footer = "Pied de page";
  texts.footer_add = "Imprimer pied de page";
  texts.footer_horizontal_line = "Imprimer la bordure de séparation";
  texts.texts = "Textes (vide = valeurs par défaut)";
  texts.languages = "Langue";
  texts.languages_remove = "Souhaitez-vous supprimer '<removedLanguages>' de la liste des langues?";
  texts.fr_param_text_info_invoice_number = "Numéro de facture";
  texts.fr_param_text_info_date = "Date facture";
  texts.fr_param_text_info_order_number = "Numéro de commande";
  texts.fr_param_text_info_order_date = "Date de commande";
  texts.fr_param_text_info_customer = "Numéro Client";
  texts.fr_param_text_info_customer_vat_number = "Numéro de TVA client";
  texts.fr_param_text_info_customer_fiscal_number = "Numéro fiscal client";
  texts.fr_param_text_info_due_date = "Échéance facture";
  texts.fr_param_text_info_page = "Numéro de page";
  texts.fr_param_text_shipping_address = "Adresse de livraison";
  texts.fr_param_text_title_doctype_10 = "Titre de la facture";
  texts.fr_param_text_title_doctype_12 = "Titre note de crédit";
  texts.fr_param_text_begin = "Texte de début";
  texts.fr_param_text_details_columns = "Noms des colonnes des détails de la facture";
  texts.fr_param_text_totalnet = "Total net facture";
  texts.fr_param_text_vat = "TVA facture";
  texts.fr_param_text_total = "Total facture";
  texts.fr_param_text_final = "Texte final";
  texts.fr_param_footer_left = "Pied de page gauche";
  texts.fr_param_footer_center = "Pied de page centre";
  texts.fr_param_footer_right = "Pied de page droit";
  texts.styles = "Styles";
  texts.color_text = "Couleur de texte";
  texts.color_background_details_header = "Couleur de fond pour l'en-tête des détails";
  texts.color_details_header_text = "Couleur de texte pour l'en-tête des détails";
  texts.color_background_alternate_lines = "Couleur de fond pour les lignes alternées";
  texts.font_family = "Type de caractère";
  texts.font_size = "Taille des caractères";
  texts.embedded_javascript_file_not_found = "Fichier JavaScript non trouvé ou invalide";
  texts.embedded_javascript = "JavaScript / CSS";
  texts.embedded_javascript_filename = "Nom fichier JS (colonne 'ID' du tableau Documents)";
  texts.embedded_css_filename = "Nom fichier CSS (colonne 'ID' du tableau Documents)";

  texts.error1 = "Les noms des colonnes ne correspondent pas aux textes à imprimer. Vérifiez les paramètres de la facture.";
  texts.fr_error1_msg = "Le texte et les noms des colonnes ne correspondent pas";

  texts.offer = "Offre";
  texts.fr_param_text_info_offer_number = "Numéro offre";
  texts.fr_param_text_info_date_offer = "Date offre";
  texts.fr_param_text_info_validity_date_offer = "Validité de l'offre";
  texts.validity_terms_label = "Validité";
  texts.fr_param_text_title_doctype_17 = "Titre offre"; 
  texts.fr_param_text_begin_offer = "Texte de début offre";
  texts.fr_param_text_final_offer = "Texte final offre";

  texts.details_columns_predefined = "Colonnes prédéfinies" ;
  texts.predefined_columns_0 = "- Sélectionner -";
  texts.predefined_columns_1 = "Libellé,Montant";
  texts.predefined_columns_2 = "Libellé,Quantité,Unité,Prix Unitaire,Montant";
  texts.predefined_columns_3 = "Article,Libellé,Montant";
  texts.predefined_columns_4 = "Article,Libellé,Quantité,Unité,Prix Unitaire,Montant";
  texts.predefined_columns_5 = "Image article,Article,Libellé,Quantité,Unité,Prix Unitaire,Montant (ADVANCED)";
  texts.predefined_columns_6 = "Libellé,Rabais,Montant (ADVANCED)";
  texts.predefined_columns_7 = "Libellé,Quantité,Unité,Prix Unitaire,Rabais,Montant (ADVANCED)";
  texts.predefined_columns_8 = "Article,Date,Libellé,Quantité,Unité,Prix Unitaire,Rabais,Montant (ADVANCED)";
  texts.style_change_confirm_title = "Colonnes prédéfinies";
  texts.style_change_confirm_msg = "Appliquer les colonnes '%1'?\nLes paramètres actuels des colonnes seront remplacés.";
}

function setTexts_NL(texts) {
  texts.phone = "Tel";
  texts.shipping_address = "Verzendadres";
  texts.invoice = "Factuur";
  texts.date = "Datum";
  texts.customer = "Klantennummer";
  texts.vat_number = "BTW-nummer";
  texts.fiscal_number = "RSIN";
  texts.payment_due_date_label = "Vervaldatum";
  texts.payment_terms_label = "Betaling";
  texts.page = "Pagina";
  texts.credit_note = "Credit nota";
  texts.description = "Beschrijving";
  texts.quantity = "Hoeveelheid";
  texts.reference_unit = "Eenheid";
  texts.unit_price = "Eenheidsprijs";
  texts.amount = "Bedrag";
  texts.discount = "Korting";
  texts.deposit = "Reeds betaald";
  texts.totalnet = "Totaal netto";
  texts.subtotal = "Subtotaal";
  texts.vat = "BTW";
  texts.rounding = "Afronding";
  texts.total = "TOTAAL";
  texts.include = "Afdrukken";
  texts.header_include = "Koptekst";
  texts.header_print = "Koptekst pagina";
  texts.header_row_1 = "Tekst rij 1";
  texts.header_row_2 = "Tekst rij 2";
  texts.header_row_3 = "Tekst rij 3";
  texts.header_row_4 = "Tekst rij 4";
  texts.header_row_5 = "Tekst rij 5";
  texts.logo_print = "Logo";
  texts.logo_name = "Logo aanpassing naam";
  texts.address_include = "Adres klant";
  texts.address_small_line = "Adres afzender";
  texts.address_left = "Adres links plaatsen";
  texts.address_composition = "Adres compositie";
  texts.address_position_dX = 'Horizontaal verplaatsen +/- (in cm, standaard 0)';
  texts.address_position_dY = 'Verticaal verplaatsen +/- (in cm, standaard 0)';
  texts.shipping_address = "Verzendadres";
  texts.info_include = "Informatie";
  texts.info_invoice_number = "Factuurnummer";
  texts.info_date = "Factuurdatum";
  texts.info_customer = "Klantennummer";
  texts.info_customer_vat_number = "BTW-nummer klant";
  texts.info_customer_fiscal_number = "RSIN klant";
  texts.info_due_date = "Vervaldatum factuur";
  texts.info_page = "Paginanummer";
  texts.info_custom_fields = "Gepersonaliseerde velden";
  texts.details_include = "Details factuur";
  texts.details_columns = "Namen kolommen";
  texts.details_columns_widths = "Kolombreedte";
  texts.details_columns_titles_alignment = "Uitlijning titels";
  texts.details_columns_alignment = "Kolomuitlijning";
  texts.details_gross_amounts = "Brutobedragen (inclusief BTW)";
  texts.footer = "Voettekst";
  texts.footer_add = "Voettekst afdrukken";
  texts.footer_horizontal_line = "Afdrukken scheidingsrand";
  texts.texts = "Teksten (leeg = standaardwaarden)";
  texts.languages = "Talen";
  texts.languages_remove = "Wilt u '<removedLanguages>' uit de lijst met talen verwijderen?";
  texts.nl_param_text_info_invoice_number = "Factuurnummer";
  texts.nl_param_text_info_date = "Factuurdatum";
  texts.nl_param_text_info_customer = "Klantennummer";
  texts.nl_param_text_info_customer_vat_number = "BTW-nummer klant";
  texts.nl_param_text_info_customer_fiscal_number = "RSIN klant";
  texts.nl_param_text_info_due_date = "Vervaldatum factuur";
  texts.nl_param_text_info_page = "Paginanummer";
  texts.nl_param_text_shipping_address = "Verzendadres";
  texts.nl_param_text_title_doctype_10 = "Factuurtitel";
  texts.nl_param_text_title_doctype_12 = "Titel credit nota";
  texts.nl_param_text_details_columns = "Kolomnamen factuur details";
  texts.nl_param_text_totalnet = "Factuur totaal netto";
  texts.nl_param_text_vat = "Factuur BTW";
  texts.nl_param_text_total = "Totaal factuur";
  texts.nl_param_text_final = "Definitieve tekst";
  texts.nl_param_footer_left = "Voettekst links";
  texts.nl_param_footer_center = "Voettekst midden";
  texts.nl_param_footer_right = "Voettekst rechts";
  texts.styles = "Stijlen";
  texts.color_text = "Tekstkleur";
  texts.color_background_details_header = "Achtergrondkleur koptekst details";
  texts.color_details_header_text = "Tekstkleur koptekst details";
  texts.color_background_alternate_lines = "Achtergrondkleur voor alternatieve rijen";
  texts.font_family = "Lettertype";
  texts.font_size = "Karaktergrootte";
  texts.embedded_javascript_file_not_found = "JavaScript-bestand niet gevonden of ongeldig";
  texts.embedded_javascript = "JavaScript-bestand ";
  texts.embedded_javascript_filename = "JS bestandsnaam ('ID' kolom van Documenten tabel)";
  texts.embedded_css_filename = "CSS bestandsnaam ('ID' kolom van Documenten tabel)";

  texts.error1 = "Kolomnamen komen niet overeen met de af te drukken tekst. Controleer de factuurinstellingen.";
  texts.nl_error1_msg = "Tekstnamen en kolommen komen niet overeen";

  texts.offer = "Offerte";
  texts.nl_param_text_info_offer_number = "Nummer Offerte";
  texts.nl_param_text_info_date_offer = "Datum offerte";
  texts.nl_param_text_info_validity_date_offer = "Geldigheidsduur van de offerte";
  texts.validity_terms_label = "Geldigheid";
  texts.nl_param_text_title_doctype_17 = "Titel offerte";
  texts.nl_param_text_begin_offer = "Begintekst offerte";
  texts.nl_param_text_final_offer = "Eindtekst offerte";

  texts.order_number = "Bestelnummer";
  texts.order_date = "Datum bestelling";
  texts.info_order_number = "Bestelnummer";
  texts.info_order_date = "Datum bestelling";
  texts.details_additional_descriptions = "Extra beschrijvingen afdrukken";
  texts.nl_param_text_info_order_number = "Bestelnummer";
  texts.nl_param_text_info_order_date = "Datum bestelling";
  texts.nl_param_text_begin = "Begintekst";

  texts.details_columns_predefined = "Voorgedefinieerde kolommen";
  texts.predefined_columns_0 = "- Selecteren -";
  texts.predefined_columns_1 = "Beschrijving,Bedrag";
  texts.predefined_columns_2 = "Beschrijving,Hoeveelheid,Eenheid,Eenheidsprijs,Bedrag";
  texts.predefined_columns_3 = "Item,Beschrijving,Bedrag";
  texts.predefined_columns_4 = "Item,Beschrijving,Hoeveelheid,Eenheid,Eenheidsprijs,Bedrag";
  texts.predefined_columns_5 = "Afbeelding Item,Item,Beschrijving,Hoeveelheid,Eenheid,Eenheidsprijs,Bedrag (ADVANCED)";
  texts.predefined_columns_6 = "Beschrijving,Korting,Bedrag (ADVANCED)";
  texts.predefined_columns_7 = "Beschrijving,Hoeveelheid,Eenheid,Eenheidsprijs,Korting,Bedrag (ADVANCED)";
  texts.predefined_columns_8 = "Item,Datum,Beschrijving,Hoeveelheid,Eenheid,Eenheidsprijs,Korting,Bedrag (ADVANCED)";
  texts.style_change_confirm_title = "Voorgedefinieerde kolommen";
  texts.style_change_confirm_msg = "De ’%1' kolommen toepassen?\nDe huidige kolominstellingen worden vervangen.";
}

function setTexts_ZH(texts) {
  texts.phone = "电话";
  texts.shipping_address = "送货地址";
  texts.invoice = "发票";
  texts.date = "日期";
  texts.customer = "客户编号";
  texts.vat_number = "增值税号码";
  texts.fiscal_number = "税务登记号";
  texts.payment_due_date_label = "到期日";
  texts.payment_terms_label = "到期日";
  texts.page = "页面";
  texts.credit_note = "信用票据";
  texts.description = "摘要";
  texts.quantity = "数量";
  texts.reference_unit = "单位";
  texts.unit_price = "单价";
  texts.amount = "金额";
  texts.discount = "折扣";
  texts.deposit = "订金";
  texts.totalnet = "总净值 ";
  texts.subtotal = "小计";
  texts.vat = "增值税";
  texts.rounding = "四舍五入";
  texts.total = "总计";
  texts.include = "打印";
  texts.header_include = "标题";
  texts.header_print = "页标题";
  texts.header_row_1 = "第 1 行的文字";
  texts.header_row_2 = "第 2 行的文字";
  texts.header_row_3 = "第 3 行的文字";
  texts.header_row_4 = "第 4 行的文字";
  texts.header_row_5 = "第 5 行的文字";
  texts.logo_print = "商标(Logo)";
  texts.logo_name = "标志定制名称";
  texts.address_include = "客户地址";
  texts.address_small_line = "发件人地址文字";
  texts.address_left = "向左对齐";
  texts.address_composition = "地址合成";
  texts.address_position_dX = '水平移动+/-（单位：厘米，默认为0）';
  texts.address_position_dY = '垂直移动+/-（单位：厘米，默认为0）';
  texts.shipping_address = "送货地址";
  texts.info_include = "信息";
  texts.info_invoice_number = "发票号码";
  texts.info_date = "发票日期";
  texts.info_customer = "客户号码";
  texts.info_customer_vat_number = "客户增值税号码";
  texts.info_customer_fiscal_number = "客户税务登记号";
  texts.info_due_date = "发票到期日";
  texts.info_page = "页码";
  texts.info_custom_fields = "自定义字段";
  texts.details_include = "发票细节";
  texts.details_columns = "列的名称";
  texts.details_columns_widths = "列的宽度";
  texts.details_columns_titles_alignment = "标题对齐";
  texts.details_columns_alignment = "文字对齐";
  texts.details_gross_amounts = "总金额(包括增值税)";
  texts.footer = "页脚";
  texts.footer_add = "打印页脚";
  texts.footer_horizontal_line = "打印分隔边框";
  texts.texts = "文字（空=默认值）";
  texts.languages = "语言";
  texts.languages_remove = "您想从语言列表中删除'<removedLanguages>'吗？";
  texts.zh_param_text_info_invoice_number = "发票号码";
  texts.zh_param_text_info_date = "发票日期";
  texts.zh_param_text_info_customer = "客户号码";
  texts.zh_param_text_info_customer_vat_number = "客户增值税号码";
  texts.zh_param_text_info_customer_fiscal_number = "客户税务登记号";
  texts.zh_param_text_info_due_date = "发票到期日";
  texts.zh_param_text_info_page = "页码";
  texts.zh_param_text_shipping_address = "送货地址";
  texts.zh_param_text_title_doctype_10 = "发票标题";
  texts.zh_param_text_title_doctype_12 = "信贷票据标题";
  texts.zh_param_text_details_columns = "列名称发票细节";
  texts.zh_param_text_totalnet = "发票总净额 ";
  texts.zh_param_text_vat = "发票增值税";
  texts.zh_param_text_total = "发票总额";
  texts.zh_param_text_final = "最终文本";
  texts.zh_param_footer_left = "页脚左侧文字";
  texts.zh_param_footer_center = "页脚中心文本";
  texts.zh_param_footer_right = "页脚右侧文本";
  texts.styles = "样式";
  texts.color_text = "文字颜色";
  texts.color_background_details_header = "标题细节的背景颜色";
  texts.color_details_header_text = "标题细节的文字颜色";
  texts.color_background_alternate_lines = "备选线的背景颜色";
  texts.font_family = "字体系列";
  texts.font_size = "字体大小";
  texts.embedded_javascript_file_not_found = "JavaScript 文件未找到或无效";
  texts.embedded_javascript = "JavaScript / CSS";
  texts.embedded_javascript_filename = "JS文件名称(文件表格内的'标识'列)";
  texts.embedded_css_filename = "CSS文件名(文件表格内的'标识'列)";

  texts.error1 = "列名称与要打印的文本不匹配。检查发票设置。";
  texts.zh_error1_msg = "文字名和列不匹配";

  texts.offer = "预估";
  texts.zh_param_text_info_offer_number = "预估号码";
  texts.zh_param_text_info_date_offer = "预估日期";
  texts.zh_param_text_info_validity_date_offer = "预估有效性";
  texts.validity_terms_label = "有效性";
  texts.zh_param_text_title_doctype_17 = "预测标题";
  texts.zh_param_text_begin_offer = "开始文字预估";
  texts.zh_param_text_final_offer = "最终文本预估";

  texts.order_number = "订单号";
  texts.order_date = "订单日期";
  texts.info_order_number = "订单号";
  texts.info_order_date = "订单日期";
  texts.details_additional_descriptions = "打印额外的摘要";
  texts.zh_param_text_info_order_number = "订单号";
  texts.zh_param_text_info_order_date = "订单日期";
  texts.zh_param_text_begin = "起始文字";

  texts.details_columns_predefined = "预定义列";
  texts.predefined_columns_0 = "- 选择 -";
  texts.predefined_columns_1 = "摘要,金额";
  texts.predefined_columns_2 = "摘要,数量,单位,单价,金额";
  texts.predefined_columns_3 = "物品,摘要,金额";
  texts.predefined_columns_4 = "物品,摘要,数量,单位,单价,金额";
  texts.predefined_columns_5 = "物品图片,物品,摘要,数量,单位,单价,金额 (高级计划)";
  texts.predefined_columns_6 = "摘要,折扣,金额 (高级计划)";
  texts.predefined_columns_7 = "摘要,数量,单位,单价,折扣,金额 (高级计划)";
  texts.predefined_columns_8 = "物品,日期,摘要,数量,单位,单价,折扣,金额 (高级计划)";
  texts.style_change_confirm_title = "预定义列";
  texts.style_change_confirm_msg = "应用 '%1' 列?\n当前的列设置将被替换.";
}

function setTexts_EN(texts) {
  texts.phone = "Tel";
  texts.shipping_address = "Shipping address";
  texts.invoice = "Invoice";
  texts.date = "Date";
  texts.order_number = "Order No";
  texts.order_date = "Order date";
  texts.customer = "Customer No";
  texts.vat_number = "VAT No";
  texts.fiscal_number = "Fiscal No";
  texts.payment_due_date_label = "Due date";
  texts.payment_terms_label = "Due date";
  texts.page = "Page";
  texts.credit_note = "Credit note";
  texts.description = "Description";
  texts.quantity = "Quantity";
  texts.reference_unit = "Unit";
  texts.unit_price = "Unit Price";
  texts.amount = "Amount";
  texts.discount = "Discount";
  texts.deposit = "Deposit";
  texts.totalnet = "Total net";
  texts.subtotal = "Subtotal";
  texts.vat = "VAT";
  texts.rounding = "Rounding";
  texts.total = "TOTAL";
  texts.include = "Print";
  texts.header_include = "Header";
  texts.header_print = "Page header";
  texts.header_row_1 = "Line 1 text";
  texts.header_row_2 = "Line 2 text";
  texts.header_row_3 = "Line 3 text";
  texts.header_row_4 = "Line 4 text";
  texts.header_row_5 = "Line 5 text";
  texts.logo_print = "Logo";
  texts.logo_name = "Logo customization name";
  texts.address_include = "Customer address";
  texts.address_small_line = "Sender address text";
  texts.address_left = "Align left";
  texts.address_composition = "Address composition";
  texts.address_position_dX = 'Move horizontally +/- (in cm, default 0)';
  texts.address_position_dY = 'Move vertically +/- (in cm, default 0)';
  texts.shipping_address = "Shipping address";
  texts.info_include = "Information";
  texts.info_invoice_number = "Invoice number";
  texts.info_date = "Invoice date";
  texts.info_order_number = "Order number";
  texts.info_order_date = "Order date";
  texts.info_customer = "Customer number";
  texts.info_customer_vat_number = "Customer VAT number";
  texts.info_customer_fiscal_number = "Customer fiscal number";
  texts.info_due_date = "Invoice due date";
  texts.info_page = "Page number";
  texts.info_custom_fields = "Custom fields";
  texts.details_include = "Invoice details";
  texts.details_columns = "Column names";
  texts.details_columns_widths = "Column width";
  texts.details_columns_titles_alignment = "Titles alignment";
  texts.details_columns_alignment = "Texts alignment";
  texts.details_gross_amounts = "Gross amounts (VAT included)";
  texts.details_additional_descriptions = "Print additional descriptions";
  texts.footer = "Footer";
  texts.footer_add = "Print footer";
  texts.footer_horizontal_line = "Print separating border";
  texts.texts = "Texts (empty = default values)";
  texts.languages = "Languages";
  texts.languages_remove = "Do you want to remove '<removedLanguages>' from the language list?";
  texts.en_param_text_info_invoice_number = "Invoice number";
  texts.en_param_text_info_date = "Invoice date";
  texts.en_param_text_info_order_number = "Order number";
  texts.en_param_text_info_order_date = "Order date";
  texts.en_param_text_info_customer = "Customer number";
  texts.en_param_text_info_customer_vat_number = "Customer VAT number";
  texts.en_param_text_info_customer_fiscal_number = "Customer fiscal number";
  texts.en_param_text_info_due_date = "Invoice due date";
  texts.en_param_text_info_page = "Page number";
  texts.en_param_text_shipping_address = "Shipping address";
  texts.en_param_text_title_doctype_10 = "Invoice title";
  texts.en_param_text_title_doctype_12 = "Credit note title";
  texts.en_param_text_begin = "Begin text";
  texts.en_param_text_details_columns = "Column names invoice details";
  texts.en_param_text_totalnet = "Invoice total net";
  texts.en_param_text_vat = "Invoice VAT";
  texts.en_param_text_total = "Invoice total";
  texts.en_param_text_final = "Final text";
  texts.en_param_footer_left = "Footer left text";
  texts.en_param_footer_center = "Footer center text";
  texts.en_param_footer_right = "Footer right text";
  texts.styles = "Styles";
  texts.color_text = "Text color";
  texts.color_background_details_header = "Background color of details header";
  texts.color_details_header_text = "Text color of details header";
  texts.color_background_alternate_lines = "Background color for alternate lines";
  texts.font_family = "Font family";
  texts.font_size = "Font size";
  texts.embedded_javascript_file_not_found = "JavaScript file not found or invalid";
  texts.embedded_javascript = "JavaScript / CSS";
  texts.embedded_javascript_filename = "JS file name (column 'ID' of table Documents)";
  texts.embedded_css_filename = "CSS file name (column 'ID' of table Documents)";

  texts.error1 = "Column names do not match with the text to print. Check invoice settings.";
  texts.en_error1_msg = "Text names and columns do not match";

  texts.offer = "Estimate";
  texts.en_param_text_info_offer_number = "Estimate number";
  texts.en_param_text_info_date_offer = "Estimate date";
  texts.en_param_text_info_validity_date_offer = "Estimate validity";
  texts.validity_terms_label = "Validity";
  texts.en_param_text_title_doctype_17 = "Estimate title";
  texts.en_param_text_begin_offer = "Begin text estimate";
  texts.en_param_text_final_offer = "Final text estimate";

  texts.details_columns_predefined = "Predefined columns";
  texts.predefined_columns_0 = "- Select -";
  texts.predefined_columns_1 = "Description,Amount";
  texts.predefined_columns_2 = "Description,Quantity,Unit,Unit Price,Amount";
  texts.predefined_columns_3 = "Item,Description,Amount";
  texts.predefined_columns_4 = "Item,Description,Quantity,Unit,Unit Price,Amount";
  texts.predefined_columns_5 = "Item Image,Item,Description,Quantity,Unit,Unit Price,Amount (ADVANCED)";
  texts.predefined_columns_6 = "Description,Discount,Amount (ADVANCED)";
  texts.predefined_columns_7 = "Description,Quantity,Unit,Unit Price,Discount,Amount (ADVANCED)";
  texts.predefined_columns_8 = "Item,Date,Description,Quantity,Unit,Unit Price,Discount,Amount (ADVANCED)";
  texts.style_change_confirm_title = "Predefined columns";
  texts.style_change_confirm_msg = "Apply '%1' columns?\nCurrent column settings will be replaced.";
}

