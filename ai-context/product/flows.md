# User Flows

## Hlavní cesty uživatele

### Flow 1: Obchodník vytváří nabídku v terénu
1. Otevře dashboard → vidí "Další v programu" (dnešní zakázka)
2. Tapne na zakázku → detail: klient, adresa, poznámka dispečera
3. Tapne "Zahájit zaměření" → survey wizard
4. Přidává místnosti (ložnice, obývák, kuchyň...)
5. Per-room: buď quick mód (30%) nebo detailed (skříň + postel + TV)
6. Vidí live kalkulaci dole: objem · auta · lidi · cena
7. Tapne "Zobrazit nabídku" → offer page
8. Zkontroluje rozpis, případně upraví cenu (sleva/přirážka)
9. Napíše poznámku pro klienta
10. Tapne "Odeslat" → generuje token, sdílí odkaz (SMS/WhatsApp)

### Flow 2: Klient vidí nabídku
1. Otevře odkaz (/offer/[token]) — bílá stránka, bez loginu
2. Vidí: cenu, rozpis, místnosti, trasu, poznámku, datum
3. Může zavolat (CTA tlačítko)
4. (Blok 2: schválí / odmítne přímo na stránce)

### Flow 3: Dispečer vytváří zakázku z hovoru
1. Otevře Command Center (centrální tlačítko v tab baru)
2. Tapne "Nová zakázka"
3. Vyhledá klienta podle jména/telefonu (nebo vytvoří nového)
4. Zadá datum, čas, poznámku
5. Tapne "Vytvořit" → zakázka v draftu, čeká na zaměření

## Sekundární cesty
- **Hledání:** Command Center → search across zakázky i klienty
- **Navigace:** Z detail zakázky → Google Maps deeplink na adresu
- **Volání:** Z dashboardu nebo detailu → tel: link na klienta
- **Feedback:** Plovoucí button → vizuální zpětná vazba (pointfeedback)
