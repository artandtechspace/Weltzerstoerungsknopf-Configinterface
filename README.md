# Weltzerstörungsknopf
Was der Weltzerstörungskopf ist und eine genaue Dokumentation des Systems findet man [hier](https://github.com/artandtechspace/Weltzerstoerungsknopf-Documentation).

Das Web-Configinterface ist eine Webseite, welche als über die [Haupt-Software](https://github.com/artandtechspace/Weltzerstoerungsknopf-Software) ausgeliefert wird und zur Konfiguration, dem logging und tests der Hardware genutzt wird. Genaueres dazu in der oben genannten Dokumentation.

Mittels Git-[Sub-Modulen](https://www.atlassian.com/git/tutorials/git-submodule) wird immer ein aktueller Build aus dem `Build`-Branch dieses Repositorys in die [Haupt-Software](https://github.com/artandtechspace/Weltzerstoerungsknopf-Documentation) eingebunden.

Das Exportieren und ausliefern des Builds an die [Haupt-Software](https://github.com/artandtechspace/Weltzerstoerungsknopf-Documentation) wird aber hier in der 'Exportieren der Software'-Sektion erklärt

Die genaue Bedienung und Funktion des Config-tools wird außerdem auch im Dokumentationsrepository erklärt.


# Entwicklungsumgebung aufsetzen

Das Web-Config-Tool ist in [Vue.js](https://vuejs.org/) mit [Vuetify](vuetifyjs.com/) entwickelt und daher recht einfach als Entwicklungsumgebung aufzusetzen.

Hier wird empfehlen eine entsprechende IDE wie VSCode oder besser [VSCodium]() zu nehmen und dort die VueJs-Extension [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) zu nutzen.

Aber zum setup:

Nach dem Clonen des Repos per

```bash
git clone https://github.com/artandtechspace/Weltzerstoerungsknopf-Configinterface
```

müssen alle NPM-Dependencies installiert werden:

```bash
npm install
```

Mit dem Befehl

```bash
npm run dev
```

kann nun der Entwicklermodus gestartet werden, in welchem automatisch Änderungen am Code [transpiliert](https://david-barreto.com/introduction-to-the-typescript-transpiler/) und in den Browser übertragen werden.

Da die Software davon ausgeht, dass sie über die [Haupt-Software](https://github.com/artandtechspace/Weltzerstoerungsknopf-Documentation) ausgeliefert wurde, muss nun noch URL `BASE_URL` für die Verbindungen in `src/Config.ts` geändert werden, so dass diese auf eine Instanz der [Haupt-Software](https://github.com/artandtechspace/Weltzerstoerungsknopf-Documentation) zeigt (Gerne auch auf eine Lokale zum entwickeln).

# Exportieren der Software

Mit dem Befehl
```bash
npm run build
```

kann das Web-Config-Tool in reine Web-Assets gebündelt werden.

Um diese nun immer mit den neuen Versionen der [Haupt-Software](https://github.com/artandtechspace/Weltzerstoerungsknopf-Documentation) auszuliefern, müssen diese Web-Assets, welche sich im Ordner `dist/` befinden nun in den Root-Ordner des `build`-Branches dieses Repositorys gelegt werden.

Dazu einfach den Branch zu `build` wechseln:

```bash
git checkout build
```

und den Inhalt des `dist`-Ordner, welcher aufgrund der Exclusion durch die [.gitignore](https://www.atlassian.com/git/tutorials/saving-changes/gitignore)-Datei auch hier noch existieren sollte, in den Root-Ordner des Repositorys schieben.


Die finale Struktur sollte dann etwa so oder so ähnlich aussehen:

```
Weltzerstoerungsknopf-Configinterface (Build-Branch)
   ├─ assets/
   |   ├─ [...].png
   |   ├─ [...].svg
   |   ├─ [...].js
   |   └─ [...].css
   └─ index.html
```

Dieser build muss nun nur noch Committed und Gepushed werden:

```
git add .
git commit
git push
```

und im [Haupt-Software](https://github.com/artandtechspace/Weltzerstoerungsknopf-Documentation)-Repo über die Submodule eingebunden werden:

**Wichtig:** Dieser Befehl muss im **Haupt-Software-Repo** ausgeführt werden**

```bash
git submodule update
```
