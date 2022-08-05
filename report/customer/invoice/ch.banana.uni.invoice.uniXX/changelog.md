# Changelog
Sviluppo nuovo layout fattura CHxx/UNIxx.  

## Composizione estensione  
* invoiceXX.css
  * CSS del layout
* translation.js
  * Per gestire le traduzioni.
* parameters.js
  * Per gestire i parametri e gli eventi dei parametri (cambio colonne, colori).
* ch.banana.uni.invoice.uniXX.js
  * Le funzioni per la stampa dei dettagli fattura "print_details_net_amounts" e "print_details_gross_amounts" sono state rivisitate.
  * Ora non sono più un blocco unico.
  * Sono state suddivise in più funzioni, ognuna può essere una funzione hook.
    * print_details_header
    * print_details_items + print_item_row
    * print_details_discount
    * print_details_total_net
    * print_details_vat
    * print_details_rounding
    * print_details_deposit
    * print_details_total
    * print_details_subtotal
  * Aggiunte le funzioni per gestire i colori.

## Parametri  

### Logo  
 * Nessun cambiamento.

### Intestazione  
* L'intestazione non è più in grassetto.  
* La prima riga è della stessa dimensione delle altre.
* È possibile cambiare colore del testo nei parametri.
* Aggiunto parametro "Usa indirizzo contabilità".
 * Quando attivo, nell'intestazione viene utilizzato l'indirizzo definito nei parametri base.
 * Quando disattivo, nell'intestazione viene utilizzato l'indirizzo definito nei parametri "Testo riga 1" ... "Testo riga 5".  
 * (seguita la logica come per estensione Fattura da Excel)  


### Indirizzo cliente/fattura  
* Non è più in una tabella.  
* Ora è inserito come testo in un paragrafo di una sezione. 
* Nel CSS le classi sono state rinominate e i margini adattati.


### Indirizzo spedizione  
* Non è più in una tabella.  
* Ora è inserito come testo in un paragrafo di una sezione.  
* Il titoletto "Indirizzo di spedizione:" è del colore del tema scelto nei parametri.
* È possibile cambiare colore nei parametri ("Labels").  


### Informazioni  
* Ai testi fissi (label) ora viene applicato in automatico il colore del tema scelto dai parametri.
* È possibile cambiare colore nei parametri ("Labels").  


### Titolo
* Stampa titolo in una funzione separata "print_title"
* Non è più in una tabella.  
* Ora è inserito come testo in un paragrafo di una sezione.  


### Testo iniziale
* Titolo e testo iniziale sono stati divisi in due funzioni separate
* Non è più in una tabella.  
* Ora è inserito come testo in un paragrafo di una sezione.  
* Nel CSS il "begin_text_table" non serve più, si può cancellare.  



### Dettagli fattura  
 * Nessun cambiamento.  



### Testo pagamento  
* Aggiungo parametro "Testo pagamento".  
* Si inseriscono le coordinate per il pagamento.  
* In questa maniera si divide quello che è testo finale dal testo con le coordinate per il pagamento.  
* Viene stampato prima del testo finale.


### Testo finale  
 * Nessun cambiamento.  


### Stili  
 * Nessun cambiamento.


### Colori  
 * Aggiunto gruppo Colori.  
 * Aggiunto combobox per la scelta di un tema colore predefinito o personale.  
 * Aggiunto parametro per inserire un proprio colore base personale.
 * Aggiunto eventi per gestire la selezione del colore.  
 * Aggiunto colori che l'utente può impostare direttamente dai parametri:
   * Intestazione
   * Labels
   * Titolo
   * Sfondo intestazione tabella
   * Testo intestazione tabella
   * Righe alternate tabella
   * Totale
   * Linee
   * Linea totale
   * Testo
 * È possibile cambiare manualmente colore di ogni elemento.
 * Probabilmente da rendere disponibile solo per piano ADVANCED.



### Javascript / CSS  
* CSS ora campo multistringa.
* Il CSS non si inserisce più nella tabella Documenti.  
* Ora si inserisce direttamente nei parametri.  


