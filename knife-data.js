/* CookPath knife reference. Editorial text is supplied in both app languages. */
(() => {
  const E = (en, el) => ({en, el});
  const knives = [
    {
      "id": "gyuto",
      "group": "everyday",
      "name": {
        "en": "Gyuto",
        "el": "Gyuto · ιαπωνικό μαχαίρι σεφ"
      },
      "shape": "chef",
      "use": {
        "en": "A Japanese all-purpose chef’s knife for vegetables, fish and boneless meat, usually with a thinner cutting geometry.",
        "el": "Ιαπωνικό μαχαίρι γενικής χρήσης για λαχανικά, ψάρι και κρέας χωρίς κόκαλο, συνήθως με λεπτότερη γεωμετρία κόψης."
      },
      "care": {
        "en": "Avoid twisting a thin edge in food, frozen ingredients and bones.",
        "el": "Αποφύγετε το στρίψιμο μέσα στην τροφή, τα κατεψυγμένα υλικά και τα κόκαλα."
      },
      "bevel": "double"
    },
    {
      "id": "petty",
      "group": "everyday",
      "name": {
        "en": "Petty",
        "el": "Petty · μαχαίρι γενικής χρήσης"
      },
      "shape": "petty",
      "use": {
        "en": "A smaller blade for fruit, shallots, trimming and jobs that feel awkward with a large chef’s knife.",
        "el": "Μικρότερη λεπίδα για φρούτα, εσαλότ, καθάρισμα και εργασίες όπου το μεγάλο μαχαίρι σεφ δυσκολεύει."
      },
      "care": {
        "en": "Some petty knives have little knuckle clearance. Check before chopping on a board.",
        "el": "Ορισμένα petty αφήνουν λίγο χώρο για τις αρθρώσεις. Ελέγξτε το πριν κόψετε πάνω σε ξύλο."
      },
      "bevel": "double"
    },
    {
      "id": "paring",
      "group": "everyday",
      "name": {
        "en": "Paring Knife",
        "el": "Μαχαίρι ξεφλουδίσματος"
      },
      "shape": "petty",
      "use": {
        "en": "A short knife for peeling, coring and small fruit or vegetable tasks.",
        "el": "Κοντό μαχαίρι για ξεφλούδισμα, αφαίρεση πυρήνα και μικρές εργασίες σε φρούτα ή λαχανικά."
      },
      "care": {
        "en": "Keep fingers clear of the cutting path, especially when working off the board.",
        "el": "Κρατήστε τα δάχτυλα έξω από την πορεία της κόψης, ιδίως όταν δουλεύετε στο χέρι."
      },
      "bevel": "double"
    },
    {
      "id": "bread",
      "group": "everyday",
      "name": {
        "en": "Bread Knife",
        "el": "Πριονωτό μαχαίρι ψωμιού"
      },
      "shape": "bread",
      "use": {
        "en": "A toothed edge for crusty bread, tender loaves and foods with a firm skin and soft interior.",
        "el": "Οδοντωτή κόψη για τραγανό ψωμί, μαλακές φραντζόλες και υλικά με σκληρό περίβλημα και μαλακό εσωτερικό."
      },
      "care": {
        "en": "Do not grind the teeth flat on a bench stone. Use a serration tool or specialist service.",
        "el": "Μην ισιώσετε τα δόντια σε επίπεδη πέτρα. Χρειάζεται ειδικό εργαλείο ή επαγγελματίας."
      },
      "bevel": "serrated"
    },
    {
      "id": "boning",
      "group": "meat",
      "name": {
        "en": "Boning Knife",
        "el": "Μαχαίρι ξεκοκαλίσματος"
      },
      "shape": "fillet",
      "use": {
        "en": "A narrow stiff or flexible blade for separating meat from bones, joints and connective tissue.",
        "el": "Στενή, άκαμπτη ή εύκαμπτη λεπίδα για διαχωρισμό κρέατος από κόκαλα, αρθρώσεις και συνδετικό ιστό."
      },
      "care": {
        "en": "Keep the free hand out of the blade’s exit path.",
        "el": "Κρατήστε το ελεύθερο χέρι μακριά από την πορεία εξόδου της λεπίδας."
      },
      "bevel": "double"
    },
    {
      "id": "fillet",
      "group": "meat",
      "name": {
        "en": "Fillet Knife",
        "el": "Εύκαμπτο μαχαίρι φιλεταρίσματος"
      },
      "shape": "fillet",
      "use": {
        "en": "A narrow flexible blade for following fish bones and separating skin from fillets.",
        "el": "Στενή, εύκαμπτη λεπίδα για να ακολουθεί τα κόκαλα του ψαριού και να αφαιρεί το δέρμα."
      },
      "care": {
        "en": "Flexibility suits fish work but is not a substitute for accurate technique.",
        "el": "Η ελαστικότητα βοηθά στο ψάρι αλλά δεν αντικαθιστά την ακριβή τεχνική."
      },
      "bevel": "double"
    },
    {
      "id": "sujihiki",
      "group": "meat",
      "name": {
        "en": "Sujihiki",
        "el": "Sujihiki"
      },
      "shape": "slicer",
      "use": {
        "en": "A double-bevel Japanese slicer for portioning boneless meat and fish with minimal resistance.",
        "el": "Ιαπωνικό μαχαίρι δύο πλευρών για λεπτές φέτες κρέατος και ψαριού χωρίς κόκαλο."
      },
      "care": {
        "en": "A slicer, not a tool for breaking down bones.",
        "el": "Προορίζεται για φέτες και όχι για κόκαλα."
      },
      "bevel": "double"
    },
    {
      "id": "santoku",
      "group": "everyday",
      "name": {
        "en": "Santoku",
        "el": "Santoku"
      },
      "shape": "santoku",
      "use": {
        "en": "A compact Japanese all-rounder for vegetables, fish and meat. A flatter edge gives useful board contact.",
        "el": "Συμπαγές ιαπωνικό μαχαίρι γενικής χρήσης για λαχανικά, ψάρι και κρέας. Η πιο επίπεδη κόψη ακουμπά αποτελεσματικά στο ξύλο."
      },
      "care": {
        "en": "Do not force a large rocking arc into a flat section of the edge.",
        "el": "Μην πιέζετε το επίπεδο τμήμα σε έντονο λίκνισμα."
      },
      "bevel": "double"
    },
    {
      "id": "nakiri",
      "group": "vegetables",
      "name": {
        "en": "Nakiri",
        "el": "Nakiri"
      },
      "shape": "nakiri",
      "use": {
        "en": "A double-bevel Japanese vegetable knife with a tall rectangular blade and mostly flat edge.",
        "el": "Ιαπωνικό μαχαίρι λαχανικών με κόψη δύο πλευρών, ψηλή ορθογώνια λεπίδα και σχεδόν επίπεδη κόψη."
      },
      "care": {
        "en": "It resembles a cleaver but is too thin for bones.",
        "el": "Μοιάζει με μπαλτά αλλά είναι πολύ λεπτό για κόκαλα."
      },
      "bevel": "double"
    },
    {
      "id": "honesuki",
      "group": "meat",
      "name": {
        "en": "Honesuki",
        "el": "Honesuki"
      },
      "shape": "deba",
      "use": {
        "en": "A stiff triangular Japanese poultry boning knife for working around joints and the carcass.",
        "el": "Άκαμπτο τριγωνικό ιαπωνικό μαχαίρι για ξεκοκάλισμα πουλερικών γύρω από αρθρώσεις και σκελετό."
      },
      "care": {
        "en": "Often asymmetrically ground. It is not intended to chop through hard bones.",
        "el": "Συχνά έχει ασύμμετρη κόψη. Δεν προορίζεται για χτύπημα σε σκληρά κόκαλα."
      },
      "bevel": "varies"
    },
    {
      "id": "cleaver",
      "group": "meat",
      "name": {
        "en": "Meat Cleaver",
        "el": "Βαρύς μπαλτάς κρέατος"
      },
      "shape": "cleaver",
      "use": {
        "en": "A thick, heavy blade designed for appropriate bone work when the manufacturer specifies it.",
        "el": "Παχιά, βαριά λεπίδα για κατάλληλες εργασίες με κόκαλα, όταν το προβλέπει ο κατασκευαστής."
      },
      "care": {
        "en": "Match bone size to the tool. A vegetable cleaver is not interchangeable.",
        "el": "Ταιριάξτε το μέγεθος του κόκαλου με το εργαλείο. Ο μπαλτάς λαχανικών δεν είναι ισοδύναμος."
      },
      "bevel": "double"
    },
    {
      "id": "deba",
      "group": "japanese",
      "name": {
        "en": "Deba",
        "el": "Deba"
      },
      "shape": "deba",
      "use": {
        "en": "A thick single-bevel knife for breaking down fish, separating fillets and handling appropriate small fish bones.",
        "el": "Παχύ μαχαίρι μονής κόψης για καθάρισμα ψαριών, φιλετάρισμα και κατάλληλα μικρά ψαροκόκαλα."
      },
      "care": {
        "en": "Do not swing it through large bones or use it as a Western meat cleaver.",
        "el": "Μην το χτυπάτε πάνω σε μεγάλα κόκαλα και μην το χρησιμοποιείτε σαν μπαλτά κρέατος."
      },
      "bevel": "single"
    },
    {
      "id": "yanagiba",
      "group": "japanese",
      "name": {
        "en": "Yanagiba",
        "el": "Yanagiba"
      },
      "shape": "slicer",
      "use": {
        "en": "A long single-bevel fish slicer used for clean sashimi cuts and delicate presentation.",
        "el": "Μακρύ μαχαίρι ψαριού μονής κόψης για καθαρές φέτες sashimi και προσεγμένο σερβίρισμα."
      },
      "care": {
        "en": "Requires single-bevel sharpening skills and appropriate fish food-safety knowledge.",
        "el": "Χρειάζεται τεχνική μονής κόψης και γνώση ασφάλειας τροφίμων για ωμό ψάρι."
      },
      "bevel": "single"
    },
    {
      "id": "tourne",
      "group": "specialist",
      "name": {
        "en": "Tourné Knife",
        "el": "Κυρτό μαχαίρι tourné"
      },
      "shape": "curved",
      "use": {
        "en": "An inward-curved paring knife for peeling rounded produce and shaping tourné vegetables.",
        "el": "Μικρό μαχαίρι με εσωτερική καμπύλη για στρογγυλά φρούτα και λαχανικά ή διαμόρφωση tourné."
      },
      "care": {
        "en": "Its curved edge needs a suitably shaped sharpening tool.",
        "el": "Η κυρτή κόψη χρειάζεται εργαλείο ακονίσματος κατάλληλου σχήματος."
      },
      "bevel": "double"
    },
    {
      "id": "butcher",
      "group": "meat",
      "name": {
        "en": "Butcher’s Breaking Knife",
        "el": "Μαχαίρι χασάπη για τεμαχισμό"
      },
      "shape": "curved",
      "use": {
        "en": "A broad curved blade for dividing large boneless cuts and trimming meat.",
        "el": "Φαρδιά κυρτή λεπίδα για διαχωρισμό μεγάλων κομματιών χωρίς κόκαλο και καθάρισμα κρέατος."
      },
      "care": {
        "en": "Use a saw or appropriate cleaver when the task actually involves cutting bone.",
        "el": "Για κοπή κόκαλου χρειάζεται κατάλληλο πριόνι ή μπαλτάς."
      },
      "bevel": "double"
    },
    {
      "id": "kiritsuke",
      "group": "japanese",
      "name": {
        "en": "Kiritsuke",
        "el": "Παραδοσιακό kiritsuke"
      },
      "shape": "bunka",
      "use": {
        "en": "A specialist single-bevel knife combining vegetable work and fish slicing in Japanese cuisine.",
        "el": "Εξειδικευμένο μαχαίρι μονής κόψης που συνδυάζει προετοιμασία λαχανικών και τεμαχισμό ψαριού στην ιαπωνική κουζίνα."
      },
      "care": {
        "en": "Advanced tool. Do not sharpen it like a symmetrical gyuto.",
        "el": "Προχωρημένο εργαλείο. Δεν ακονίζεται όπως ένα συμμετρικό gyuto."
      },
      "bevel": "single"
    }
  ];

  const grits = [
    {range:'120–400',label:E('Repair','Επισκευή'), title:E('Coarse · reshape only when needed','Χονδρόκοκκη · αλλαγή σχήματος όταν χρειάζεται'),text:E('Large abrasive particles remove steel quickly. Use for significant dullness, small chips or bevel correction. It leaves deep scratches and removes more metal, so it is rarely the first choice for routine maintenance.','Οι μεγάλοι κόκκοι αφαιρούν γρήγορα χάλυβα. Χρησιμοποιείται για πολύ στομωμένη κόψη, μικρά σπασίματα ή διόρθωση λοξότμησης. Αφήνει βαθιές χαρακιές και αφαιρεί περισσότερο μέταλλο, οπότε σπάνια είναι η πρώτη επιλογή για απλή συντήρηση.')},
    {range:'800–1,200',label:E('Sharpen','Ακόνισμα'),title:E('Medium · the everyday starting point','Μεσαία · η καθημερινή αφετηρία'),text:E('A practical range for restoring a normally dull kitchen edge. Work until the bevel reaches the apex along the whole blade, then deburr carefully. A well-finished 1,000-grit edge is already useful for cooking.','Πρακτικό εύρος για επαναφορά μιας συνηθισμένα στομωμένης κόψης. Δουλέψτε μέχρι η λοξότμηση να φτάσει στην ακμή σε όλο το μήκος και αφαιρέστε προσεκτικά το γρέζι. Μια σωστά τελειωμένη κόψη στα 1.000 grit είναι ήδη χρήσιμη στην κουζίνα.')},
    {range:'2,000–3,000',label:E('Refine','Εξευγενισμός'),title:E('Fine · refine the working edge','Λεπτόκοκκη · βελτίωση της κόψης εργασίας'),text:E('Smaller abrasives soften the previous scratches and refine the apex. A useful finishing range for many everyday kitchen knives, with a balance of clean slicing and bite through skins. Use lighter pressure.','Οι μικρότεροι κόκκοι μειώνουν τις προηγούμενες χαρακιές και βελτιώνουν την ακμή. Χρήσιμο τελικό στάδιο για πολλά καθημερινά μαχαίρια, με ισορροπία καθαρής κοπής και αποτελεσματικότητας στη φλούδα. Εφαρμόστε ελαφρύτερη πίεση.')},
    {range:'4,000–6,000',label:E('Polish','Λείανση'),title:E('Finishing · a more polished slice','Φινίρισμα · πιο λειασμένη κοπή'),text:E('A finer finish for precise slicing and some harder kitchen knives. It refines an edge that is already sharp. Extra polish is optional and can reduce the toothy feel preferred for tomato skins or fibrous food.','Λεπτότερο φινίρισμα για ακριβείς φέτες και ορισμένα σκληρότερα μαχαίρια. Βελτιώνει μια ήδη κοφτερή ακμή. Η επιπλέον λείανση είναι προαιρετική και μπορεί να μειώσει το «δάγκωμα» που βοηθά σε ντομάτες ή ινώδη τρόφιμα.')},
    {range:'8,000+',label:E('Specialise','Εξειδίκευση'),title:E('Ultra-fine · choose for a specific job','Πολύ λεπτόκοκκη · για συγκεκριμένο σκοπό'),text:E('For specialised polishing and delicate slicing after a complete sharpening progression. It will not efficiently repair a blunt edge. Higher grit is not automatically better for every food, steel or cook.','Για εξειδικευμένη λείανση και λεπτές φέτες μετά από πλήρη ακολουθία ακονίσματος. Δεν διορθώνει αποτελεσματικά μια στομωμένη κόψη. Το υψηλότερο grit δεν είναι αυτόματα καλύτερο για κάθε τρόφιμο, χάλυβα ή μάγειρα.')}
  ];

  const steps = [];
  const S = (title,el,doEn,doEl,whyEn,whyEl) => steps.push({title:E(title,el),action:E(doEn,doEl),why:E(whyEn,whyEl)});
  S('Identify the edge','Αναγνωρίστε την κόψη','Start with an inexpensive, plain-edge, symmetrical double-bevel kitchen knife. Check its maker’s angle. Inspect for chips and cracks. Single-bevel, asymmetric, serrated and ceramic blades need their own method.','Ξεκινήστε με οικονομικό μαχαίρι λείας, συμμετρικής κόψης δύο πλευρών. Ελέγξτε τη γωνία του κατασκευαστή και αναζητήστε σπασίματα ή ρωγμές. Μονές, ασύμμετρες, οδοντωτές και κεραμικές κόψεις χρειάζονται διαφορετική μέθοδο.','Matching the existing geometry preserves cutting performance. A 50/50 routine can damage a traditional single-bevel knife.','Η διατήρηση της αρχικής γεωμετρίας προστατεύει την απόδοση. Η συμμετρική μέθοδος μπορεί να χαλάσει ένα παραδοσιακό μαχαίρι μονής κόψης.');
  S('Prepare the right stone','Προετοιμάστε σωστά την πέτρα','Follow the exact stone’s instructions. Soak a soaking waterstone for the maker’s stated time, often around 10–15 minutes. For splash-and-go models, wet the surface as directed. Do not leave every stone submerged overnight.','Ακολουθήστε τις οδηγίες της συγκεκριμένης πέτρας. Μουλιάστε την πέτρα που το απαιτεί για τον χρόνο του κατασκευαστή, συχνά περίπου 10–15 λεπτά. Στις splash-and-go βρέξτε την επιφάνεια όπως προβλέπεται. Μην αφήνετε όλες τις πέτρες όλη νύχτα στο νερό.','Water fills the pores of a soaking stone and carries away metal debris. Some binders are damaged by prolonged soaking. “Whet” means sharpen, not wet.','Το νερό γεμίζει τους πόρους και απομακρύνει τα μεταλλικά υπολείμματα. Ορισμένα συνδετικά υλικά χαλούν από παρατεταμένο μούλιασμα. Η αγγλική λέξη «whet» σημαίνει ακονίζω, όχι βρέχω.');
  S('Make a stable, flat station','Στήστε σταθερή, επίπεδη επιφάνεια','Place the stone in a non-slip holder on a secure worktop with water nearby. Flatten a dished stone with a compatible flattening plate, following its instructions. Rinse off loose abrasive.','Τοποθετήστε την πέτρα σε αντιολισθητική βάση πάνω σε σταθερό πάγκο, με νερό κοντά. Ισιώστε μια βαθουλωμένη πέτρα με κατάλληλη πλάκα σύμφωνα με τις οδηγίες της. Ξεπλύνετε τους ελεύθερους κόκκους.','A moving stone risks a slip. A hollow surface changes the bevel angle along the blade and makes repeatable sharpening difficult.','Μια πέτρα που κινείται μπορεί να προκαλέσει γλίστρημα. Μια κοίλη επιφάνεια αλλάζει τη γωνία κατά μήκος της λεπίδας και δυσκολεύει το ομοιόμορφο ακόνισμα.');
  S('Choose a sensible starting grit','Επιλέξτε κατάλληλο αρχικό grit','For an ordinarily dull knife, start around 800–1,200 grit. Use a coarse stone only when repair or major reshaping is needed. Plan a modest progression such as 1,000 → 3,000.','Για συνηθισμένο στόμωμα ξεκινήστε περίπου στα 800–1.200 grit. Χρησιμοποιήστε χονδρόκοκκη μόνο για επισκευή ή σημαντική διόρθωση. Μια λογική ακολουθία είναι 1.000 → 3.000.','Coarse grit removes material quickly. Finer grit refines its scratches. Starting too coarse wastes steel, while starting too fine takes a long time to reach a dull apex.','Το χαμηλό grit αφαιρεί γρήγορα υλικό και το υψηλότερο μειώνει τις χαρακιές του. Πολύ χονδρή αρχή σπαταλά χάλυβα, ενώ πολύ λεπτή αργεί να αποκαταστήσει στομωμένη ακμή.');
  S('Find and hold the bevel angle','Βρείτε και κρατήστε τη γωνία','Use the maker’s angle per side. Many double-bevel kitchen knives fall around 15–20° per side, but this is not universal. Colour the bevel with a marker and make a light pass to see where contact occurs. Keep the angle steady.','Ακολουθήστε τη γωνία ανά πλευρά του κατασκευαστή. Πολλά μαχαίρια δύο πλευρών βρίσκονται περίπου στις 15–20° ανά πλευρά, αλλά όχι όλα. Βάψτε τη λοξότμηση με μαρκαδόρο και κάντε ένα ελαφρύ πέρασμα για να δείτε την επαφή. Κρατήστε τη γωνία σταθερή.','Too low can grind behind the edge without reaching the apex. Too high makes a steeper edge. Consistency is more useful than guessing a perfect number.','Πολύ χαμηλή γωνία μπορεί να τρίβει πίσω από την ακμή χωρίς να την ακονίζει. Πολύ υψηλή δημιουργεί πιο απότομη κόψη. Η συνέπεια βοηθά περισσότερο από την εικασία ενός τέλειου αριθμού.');
  S('Work from heel to tip','Δουλέψτε από τη φτέρνα στη μύτη','Grip securely, place guiding fingertips on the blade face safely behind the edge, and use slow controlled strokes in overlapping sections. Apply moderate pressure and keep the surface wet. Lift the handle just enough to follow the tip’s curve.','Κρατήστε σταθερά τη λαβή και τοποθετήστε τα δάχτυλα οδήγησης στην πλατιά πλευρά, με ασφάλεια πίσω από την κόψη. Κάντε αργά περάσματα σε επικαλυπτόμενα τμήματα, με μέτρια πίεση και υγρή επιφάνεια. Σηκώστε λίγο τη λαβή για να ακολουθήσετε την καμπύλη της μύτης.','Overlapping sections cover the whole edge. Following the curve keeps the tip in contact without rounding it away. Excess force reduces control.','Τα επικαλυπτόμενα τμήματα καλύπτουν όλη την κόψη. Η καμπύλη διατηρεί τη μύτη σε επαφή χωρίς να τη στρογγυλεύει. Η υπερβολική δύναμη μειώνει τον έλεγχο.');
  S('Confirm the apex with a small burr','Επιβεβαιώστε την ακμή με μικρό γρέζι','Look for a very small burr on the side opposite the stone along heel, middle and tip. A cotton swab can help reveal it. Never run a finger along the cutting edge. Do not keep grinding to create a large burr.','Αναζητήστε πολύ μικρό γρέζι στην απέναντι πλευρά από την πέτρα, στη φτέρνα, στη μέση και στη μύτη. Μια μπατονέτα βοηθά να το εντοπίσετε. Μην περάσετε δάχτυλο κατά μήκος της κόψης και μην συνεχίζετε για μεγάλο γρέζι.','A burr is displaced metal showing the bevel has reached the edge. A large wire edge wastes steel and can hide a weak, unstable cutting edge.','Το γρέζι είναι παραμορφωμένο μέταλλο που δείχνει ότι φτάσατε στην ακμή. Το μεγάλο γρέζι σπαταλά χάλυβα και μπορεί να κρύβει αδύναμη κόψη.');
  S('Sharpen the other side','Ακονίστε την άλλη πλευρά','Turn the knife and repeat at the matching angle for this symmetrical blade. Reach the full edge, then reduce pressure and alternate sides with light passes. Judge the edge, not a rigid stroke count.','Γυρίστε το μαχαίρι και επαναλάβετε στην αντίστοιχη γωνία για αυτή τη συμμετρική λεπίδα. Φτάστε σε όλη την ακμή, μειώστε την πίεση και εναλλάξτε ελαφρά περάσματα. Κρίνετε το αποτέλεσμα και όχι έναν αυστηρό αριθμό περασμάτων.','Both bevels must meet. Equal stroke counts do not guarantee equal metal removal, because pressure and existing wear differ.','Οι δύο πλευρές πρέπει να συναντηθούν. Ίδιος αριθμός περασμάτων δεν σημαίνει ίδια αφαίρεση μετάλλου, επειδή η πίεση και η φθορά διαφέρουν.');
  S('Refine only after it is sharp','Προχωρήστε μόνο αφού ακονίσει','Rinse the knife, hands and work area before switching to a finer stone, for example 2,000–3,000. Repeat with lighter pressure to refine the previous scratches. Stop at a finish that suits your cooking.','Ξεπλύνετε μαχαίρι, χέρια και χώρο πριν αλλάξετε σε λεπτότερη πέτρα, π.χ. 2.000–3.000. Επαναλάβετε με ελαφρύτερη πίεση για να μειώσετε τις προηγούμενες χαρακιές. Σταματήστε στο φινίρισμα που εξυπηρετεί τη μαγειρική σας.','Coarse particles carried onto a fine stone make fresh scratches. Fine grit improves an established edge rather than replacing the work of the first stone.','Οι χονδροί κόκκοι σε λεπτή πέτρα δημιουργούν νέες χαρακιές. Το λεπτό grit βελτιώνει ήδη σχηματισμένη ακμή και δεν αντικαθιστά τη δουλειά της πρώτης πέτρας.');
  S('Deburr, then optionally strop','Αφαιρέστε το γρέζι και προαιρετικά περάστε σε δέρμα','Finish with very light alternating passes on the stone. If using leather, place it on a firm base and make a few light, edge-trailing passes at the bevel angle, with the spine leading and the edge following. Do not push the edge into leather.','Τελειώστε με πολύ ελαφρά εναλλασσόμενα περάσματα στην πέτρα. Αν χρησιμοποιήσετε δέρμα, στηρίξτε το σε σταθερή βάση και κάντε λίγα ελαφρά περάσματα στη γωνία της κόψης, με τη ράχη να προηγείται και την κόψη να ακολουθεί. Μην σπρώχνετε την κόψη μέσα στο δέρμα.','Deburring removes weak metal at the apex. A strop can clean up the finish, but heavy pressure or too high an angle rounds the edge. Stropping is optional.','Η αφαίρεση γρεζιού απομακρύνει αδύναμο μέταλλο. Το δέρμα βοηθά στο τελείωμα, αλλά πολλή πίεση ή μεγάλη γωνία στρογγυλεύει την ακμή. Είναι προαιρετικό.');
  S('Use a honing rod only when suitable','Χρησιμοποιήστε μασάτι μόνο όταν ταιριάζει','A smooth steel rod can help realign slight rolling on some softer European-style edges between sharpenings. If approved for your knife, plant the rod tip securely on a towel-covered board and use slow, light heel-to-tip strokes at the maker’s angle. A ceramic or diamond rod removes metal.','Ένα λείο μεταλλικό μασάτι μπορεί να ευθυγραμμίσει ελαφρύ γύρισμα σε ορισμένες πιο μαλακές ευρωπαϊκές κόψεις ανάμεσα στα ακονίσματα. Αν επιτρέπεται για το μαχαίρι σας, στηρίξτε τη μύτη σε ξύλο με πετσέτα και κάντε αργά, ελαφρά περάσματα από τη φτέρνα στη μύτη στη γωνία του κατασκευαστή. Κεραμικό ή διαμαντένιο μασάτι αφαιρεί μέταλλο.','A rod is not a required final stage after stones and cannot repair a worn-away edge. Hard, thin or brittle Japanese edges can chip on rods. Use the maker’s advice; a fine stone or strop is often preferable.','Το μασάτι δεν είναι υποχρεωτικό τελικό στάδιο και δεν αποκαθιστά φθαρμένη ακμή. Σκληρές, λεπτές ή εύθραυστες ιαπωνικές κόψεις μπορεί να σπάσουν σε μασάτι. Ακολουθήστε τον κατασκευαστή· συχνά προτιμάται λεπτή πέτρα ή δέρμα.');
  S('Test, clean and dry','Δοκιμάστε, καθαρίστε και στεγνώστε','Rinse away all residue and dry the knife. Test with a controlled slice through paper held clear of your fingers, then a tomato on a board. Never test on skin. Rinse and air-dry stones as directed, away from strong heat.','Ξεπλύνετε όλα τα υπολείμματα και στεγνώστε το μαχαίρι. Δοκιμάστε με ελεγχόμενη τομή σε χαρτί μακριά από τα δάχτυλα και μετά σε ντομάτα πάνω σε ξύλο. Ποτέ πάνω στο δέρμα. Ξεπλύνετε και στεγνώστε τις πέτρες στον αέρα όπως προβλέπεται, μακριά από έντονη θερμότητα.','A useful edge cuts cleanly at heel, middle and tip without excess pressure. Dry storage protects the steel and the stone’s binder.','Μια χρήσιμη κόψη κόβει καθαρά στη φτέρνα, στη μέση και στη μύτη χωρίς υπερβολική πίεση. Η στεγνή αποθήκευση προστατεύει χάλυβα και συνδετικό υλικό της πέτρας.');

  const steels = [];
  const M=(name,family,cr,traits,el,sharpen,sharpenEl)=>steels.push({name,family,cr,traits:E(traits,el),sharpen:E(sharpen,sharpenEl)});
  M('X50CrMoV15 / 1.4116','stainless','~15%','Common European kitchen steel. Practical toughness and easy upkeep, with moderate wear resistance.','Συνηθισμένος ευρωπαϊκός χάλυβας κουζίνας. Πρακτική αντοχή σε θραύση και εύκολη φροντίδα, με μέτρια αντοχή στη φθορά.','Usually straightforward on waterstones.','Συνήθως εύκολος σε πέτρες νερού.');
  M('AUS-8','stainless','~13–14.5%','A familiar Japanese stainless grade in everyday knives. Balanced maintenance and cutting performance.','Γνωστός ιαπωνικός ανοξείδωτος σε καθημερινά μαχαίρια. Ισορροπεί συντήρηση και απόδοση.','Generally approachable on conventional stones.','Γενικά εύχρηστος σε συμβατικές πέτρες.');
  M('AUS-10','stainless','~13–14.5%','More carbon than AUS-8, allowing harder wear-resistant edges with suitable heat treatment.','Περισσότερος άνθρακας από τον AUS-8, για σκληρότερες κόψεις με κατάλληλη θερμική κατεργασία.','Take care to remove the final burr.','Αφαιρέστε προσεκτικά το τελικό γρέζι.');
  M('VG-10','stainless','~15%','A widely used high-carbon stainless kitchen grade from Takefu. Heat treatment and edge thickness govern chip resistance.','Διαδεδομένος ανοξείδωτος χάλυβας υψηλού άνθρακα της Takefu. Η θερμική κατεργασία και το πάχος της κόψης επηρεάζουν τα σπασίματα.','Waterstones work well. Deburr patiently.','Κατάλληλος για πέτρες νερού. Θέλει προσεκτική αφαίρεση γρεζιού.');
  M('VG-1','stainless','~13–15%','A conventional Japanese stainless cutlery grade used in both kitchen and utility knives.','Συμβατικός ιαπωνικός ανοξείδωτος για μαχαίρια κουζίνας και γενικής χρήσης.','Ordinary suitable waterstones are practical.','Πρακτική επιλογή οι κατάλληλες κοινές πέτρες νερού.');
  M('Ginsan / GIN 3 / Silver 3','stainless','~13–14.5%','A fine-edged Japanese stainless grade popular in traditional-looking kitchen knives.','Ιαπωνικός ανοξείδωτος που δίνει λεπτή ακμή, δημοφιλής σε μαχαίρια παραδοσιακής εμφάνισης.','Often pleasant to sharpen on waterstones.','Συχνά ακονίζεται ευχάριστα σε πέτρες νερού.');
  M('AEB-L','stainless','~13%','Fine-carbide stainless originally associated with razor applications. Suits thin, stable kitchen edges when well treated.','Ανοξείδωτος με λεπτά καρβίδια, συνδεδεμένος αρχικά με ξυραφάκια. Κατάλληλος για λεπτές, σταθερές κόψεις με σωστή κατεργασία.','Usually responsive to conventional abrasives.','Συνήθως ανταποκρίνεται καλά σε συμβατικά λειαντικά.');
  M('12C27','stainless','~13.5%','Alleima stainless with a practical balance of toughness, corrosion resistance and attainable sharpness.','Ανοξείδωτος της Alleima με πρακτική ισορροπία αντοχής σε θραύση, διάβρωση και δυνατότητα κοφτερής ακμής.','Typically easy to maintain on waterstones.','Συνήθως εύκολη συντήρηση σε πέτρες νερού.');
  M('14C28N','stainless','~14%','Nitrogen-alloyed Alleima stainless designed for fine edges and corrosion resistance.','Ανοξείδωτος της Alleima με άζωτο, σχεδιασμένος για λεπτές κόψεις και αντοχή στη διάβρωση.','Conventional stones are usually effective.','Οι συμβατικές πέτρες είναι συνήθως αποτελεσματικές.');
  M('SG2 / SPG2 / R2','stainless','~14–16%','A powder-metallurgy kitchen steel with good wear resistance. SG2 and R2 labels are often grouped commercially; confirm the actual material.','Χάλυβας κονιομεταλλουργίας για κουζίνα με καλή αντοχή στη φθορά. Οι εμπορικές ονομασίες SG2 και R2 συχνά ομαδοποιούνται· επιβεβαιώστε το πραγματικό υλικό.','Usually takes more work than simpler stainless steels.','Συνήθως χρειάζεται περισσότερη δουλειά από απλούστερους ανοξείδωτους.');
  M('SRS13 / SRS15','stainless','~13%','Powder high-speed steel grades used in some hard kitchen knives. Distinct compositions, not identical steels.','Ποιότητες κονιομεταλλουργικού ταχυχάλυβα σε ορισμένα σκληρά μαχαίρια κουζίνας. Διαφορετικές συνθέσεις, όχι ταυτόσημοι χάλυβες.','Use effective abrasives and patient light finishing.','Χρειάζονται αποτελεσματικά λειαντικά και υπομονετικό, ελαφρύ τελείωμα.');
  M('440C','stainless','~16–18%','A conventional high-carbon stainless grade. Carbide size and heat treatment affect its edge behaviour.','Συμβατικός ανοξείδωτος υψηλού άνθρακα. Το μέγεθος καρβιδίων και η θερμική κατεργασία επηρεάζουν την κόψη.','Moderate sharpening effort with suitable stones.','Μέτρια προσπάθεια με κατάλληλες πέτρες.');
  M('N690','stainless','~17.3%','Böhler cobalt-alloyed stainless used in cutlery. Useful wear resistance with everyday corrosion protection.','Ανοξείδωτος της Böhler με κοβάλτιο για μαχαίρια. Χρήσιμη αντοχή στη φθορά και καθημερινή προστασία από διάβρωση.','Conventional abrasives can work; keep the burr small.','Δουλεύεται με συμβατικά λειαντικά· κρατήστε μικρό το γρέζι.');
  M('CPM 154','stainless','~14%','Powder version of the 154CM composition, with a more even carbide distribution. Used by some custom kitchen makers.','Κονιομεταλλουργική εκδοχή της σύνθεσης 154CM με πιο ομοιόμορφη κατανομή καρβιδίων. Χρησιμοποιείται και σε χειροποίητα μαχαίρια κουζίνας.','A little slower than simpler low-carbide grades.','Λίγο πιο αργός από απλούστερες ποιότητες με λιγότερα καρβίδια.');
  M('CPM MagnaCut','stainless','~10.7%','A modern powder stainless designed to balance toughness, wear and corrosion resistance. Shows why chromium percentage alone is insufficient.','Σύγχρονος ανοξείδωτος κονιομεταλλουργίας που ισορροπεί θραύση, φθορά και διάβρωση. Δείχνει γιατί το ποσοστό χρωμίου δεν αρκεί μόνο του.','Diamond or CBN abrasives help with its hard carbides.','Τα διαμαντένια ή CBN λειαντικά βοηθούν στα σκληρά καρβίδια.');
  M('M390','stainless','~20%','Böhler powder stainless with high wear resistance. More common in other cutlery, with some kitchen applications.','Ανοξείδωτος κονιομεταλλουργίας της Böhler με υψηλή αντοχή στη φθορά. Συχνότερος σε άλλα μαχαίρια, με ορισμένες χρήσεις στην κουζίνα.','Diamond or CBN is efficient. Avoid excessive thinning.','Διαμάντι ή CBN είναι αποτελεσματικό. Αποφύγετε υπερβολικό λέπτυσμα.');
  M('ZDP-189','semi','~20%','Very high carbon ties up much of its chromium in carbides. Often sold as stainless, but practical corrosion resistance is limited.','Ο πολύ υψηλός άνθρακας δεσμεύει μεγάλο μέρος του χρωμίου σε καρβίδια. Συχνά πωλείται ως ανοξείδωτος αλλά η πρακτική αντοχή στη διάβρωση είναι περιορισμένη.','High wear resistance makes sharpening slower.','Η υψηλή αντοχή στη φθορά κάνει το ακόνισμα πιο αργό.');
  M('SKD12 / A2 family','semi','~5%','Tool-steel family used in some semi-stainless kitchen cores. Naming and exact chemistry need maker confirmation.','Οικογένεια εργαλειοχάλυβα σε ορισμένους ημιανοξείδωτους πυρήνες κουζίνας. Η ονομασία και η ακριβής σύνθεση θέλουν επιβεβαίωση από τον κατασκευαστή.','Sharpenable on suitable waterstones; wipe frequently in use.','Ακονίζεται σε κατάλληλες πέτρες· σκουπίζετε συχνά κατά τη χρήση.');
  M('SKD11 / D2 family','semi','~11–13%','High-carbon, high-chromium tool steels. Frequently called semi-stainless because chromium carbides limit rust protection.','Εργαλειοχάλυβες υψηλού άνθρακα και χρωμίου. Συχνά λέγονται ημιανοξείδωτοι επειδή τα καρβίδια περιορίζουν την προστασία από σκουριά.','Wear resistant. Effective abrasives reduce effort.','Ανθεκτικοί στη φθορά. Τα αποτελεσματικά λειαντικά μειώνουν τον κόπο.');
  M('SLD','semi','~11–13%','A modified die-steel grade used in some kitchen knives. Treat it as rust-prone despite stainless-looking cladding.','Τροποποιημένος εργαλειοχάλυβας σε ορισμένα μαχαίρια κουζίνας. Αντιμετωπίστε τον ως ευαίσθητο στη σκουριά, ακόμη και με ανοξείδωτη επένδυση.','Keep the exposed core dry; follow maker’s stone advice.','Κρατήστε στεγνό τον εκτεθειμένο πυρήνα και ακολουθήστε τις οδηγίες ακονίσματος.');
  M('Shirogami / White 1','carbon','Trace / Ίχνη','High-carbon traditional Japanese steel with few alloy additions. White 1 contains more carbon than White 2.','Παραδοσιακός ιαπωνικός χάλυβας υψηλού άνθρακα με λίγα πρόσθετα. Ο White 1 έχει περισσότερο άνθρακα από τον White 2.','Often takes a crisp waterstone edge. Wipe and dry promptly.','Συχνά δίνει καθαρή ακμή σε πέτρα νερού. Σκουπίστε και στεγνώστε αμέσως.');
  M('Shirogami / White 2','carbon','Trace / Ίχνη','Traditional reactive carbon steel, valued for sharpening feel and fine edges. Patina develops with use.','Παραδοσιακός αντιδραστικός χάλυβας άνθρακα, γνωστός για την αίσθηση στο ακόνισμα και τη λεπτή ακμή. Αναπτύσσει πατίνα.','Usually responsive on waterstones. Needs active rust prevention.','Συνήθως ανταποκρίνεται καλά σε πέτρες. Χρειάζεται ενεργή πρόληψη σκουριάς.');
  M('Aogami / Blue 1','carbon','~0.2–0.5%','Traditional Japanese carbon steel with tungsten and chromium additions. More carbon than Blue 2.','Παραδοσιακός ιαπωνικός χάλυβας άνθρακα με βολφράμιο και χρώμιο. Περισσότερος άνθρακας από τον Blue 2.','Usually more abrasion resistant than White steel.','Συνήθως πιο ανθεκτικός στην τριβή από τον White.');
  M('Aogami / Blue 2','carbon','~0.2–0.5%','A reactive Japanese alloy carbon steel used in many hand-forged kitchen knives. Still requires drying.','Αντιδραστικός ιαπωνικός κραματωμένος χάλυβας άνθρακα σε πολλά χειροποίητα μαχαίρια. Εξακολουθεί να χρειάζεται στέγνωμα.','Waterstones work well; maintain a stable angle.','Δουλεύεται καλά σε πέτρες· κρατήστε σταθερή γωνία.');
  M('Aogami Super','carbon','~0.3–0.5%','High-carbon Blue-family steel with additional alloying for wear resistance. The name does not make it stainless.','Χάλυβας της οικογένειας Blue με υψηλό άνθρακα και πρόσθετα για αντοχή στη φθορά. Η ονομασία δεν τον κάνει ανοξείδωτο.','Can take longer to sharpen than White or Blue 2.','Μπορεί να χρειάζεται περισσότερο χρόνο από White ή Blue 2.');
  M('52100 / 100Cr6','carbon','~1.5%','Bearing steel also used for fine-edged knives. Its chromium content is too low for stainless behaviour.','Χάλυβας ρουλεμάν που χρησιμοποιείται και για λεπτές κόψεις. Το χρώμιό του δεν αρκεί για ανοξείδωτη συμπεριφορά.','Usually practical to sharpen. Wipe during wet prep.','Συνήθως πρακτικός στο ακόνισμα. Σκουπίζετε σε υγρή προετοιμασία.');
  M('1095','carbon','Trace / Ίχνη','A simple high-carbon steel used in cutlery. Rusts readily if neglected.','Απλός χάλυβας υψηλού άνθρακα για μαχαίρια. Σκουριάζει εύκολα αν παραμεληθεί.','Straightforward abrasives usually suffice. Dry immediately.','Συνήθως αρκούν απλά λειαντικά. Στεγνώστε αμέσως.');
  M('SK4 / SK5','carbon','Low / Χαμηλό','Japanese carbon tool-steel grades seen in economical kitchen knives. Reactive and capable of useful edges.','Ιαπωνικές ποιότητες εργαλειοχάλυβα άνθρακα σε οικονομικά μαχαίρια. Αντιδραστικές, με δυνατότητα καλής κόψης.','Usually accessible sharpening; prevent moisture exposure.','Συνήθως εύκολο ακόνισμα· αποφύγετε παρατεταμένη υγρασία.');
  M('O1','carbon','~0.5%','Oil-hardening tool steel used by some custom knife makers. The heat-treatment name does not mean it needs oil for sharpening.','Εργαλειοχάλυβας βαφής σε λάδι σε ορισμένα χειροποίητα μαχαίρια. Η ονομασία της θερμικής κατεργασίας δεν σημαίνει ότι ακονίζεται με λάδι.','Use the lubricant required by the stone, then dry the knife.','Χρησιμοποιήστε το υγρό που απαιτεί η πέτρα και μετά στεγνώστε το μαχαίρι.');
  M('CPM M4','carbon','~4%','A powder high-speed tool steel with strong wear resistance. It is not stainless and is less common in kitchen knives.','Κονιομεταλλουργικός ταχυχάλυβας με μεγάλη αντοχή στη φθορά. Δεν είναι ανοξείδωτος και είναι λιγότερο συνηθισμένος στην κουζίνα.','Diamond or CBN is useful for the hard carbides.','Διαμάντι ή CBN βοηθά στα σκληρά καρβίδια.');

  // Indicative finished-cutlery ranges, not a fixed property of the alloy name.
  // Maker heat treatment and the individual knife specification take precedence.
  const hardnessRanges = [
    [55,58],[56,59],[58,61],[60,62],[58,61],[59,63],[58,63],[54,61],[55,62],[61,64],
    [62,65],[57,61],[58,62],[59,63],[60,65],[60,63],[64,67],[60,64],[59,63],[60,64],
    [61,65],[60,64],[61,65],[60,64],[62,66],[60,64],[56,62],[56,62],[58,62],[62,65]
  ];
  steels.forEach((steel, i) => { steel.hrc = hardnessRanges[i]; });
  window.COOKPATH_KNIFE_DATA = {knives, grits, steps, steels};
})();
