/* Shared task review rules. Temperature, timing and taste checks stay self-confirmed. */
(() => {
  const L = window.COOKPATH_I18N?.choose || (en => en);
  const photo = new Set([1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25,28,29,30,31,32,33,34,35,36,37,38,39,40,41,43,44,45,47,49,50,51,54,56,57,59,61,62,63,65,66,67,68,69,70,71,73,74,76,77,78,79,81,82,83,85,87,88,90,91,92,96,97,100,101,102,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,120,123,124,127,128,129,130,132,133,134,136,137,138,139,143,145,147,149,150]);
  const video = new Set([4,72]);
  const custom = {
    1:[['Thumb and index finger pinch the blade just ahead of the handle.','Ο αντίχειρας και ο δείκτης πιάνουν τη λάμα ακριβώς μπροστά από τη λαβή.'],['The other fingers wrap around the handle; the knife is stationary.','Τα υπόλοιπα δάχτυλα τυλίγουν τη λαβή και το μαχαίρι παραμένει ακίνητο.']],
    2:[['The whole knife is visible, laid flat.','Φαίνεται ολόκληρο το μαχαίρι, ακουμπισμένο επίπεδα.'],['Labels identify the tip, spine, edge, heel and handle. Handwritten labels are fine.','Οι ετικέτες δείχνουν τη μύτη, τη ράχη, την κόψη, τη φτέρνα και τη λαβή. Μπορούν να είναι χειρόγραφες.']],
    3:[['Fingertips curl inward, with the thumb tucked behind.','Οι άκρες των δαχτύλων είναι λυγισμένες προς τα μέσα και ο αντίχειρας πίσω τους.'],['Knuckles face the stationary blade beside a stable vegetable.','Οι αρθρώσεις κοιτούν την ακίνητη λάμα δίπλα σε ένα σταθερό λαχανικό.']],
    4:[['Show several slow rocking cuts with the tip staying near the board.','Δείξτε μερικές αργές κυκλικές κοπές, με τη μύτη κοντά στην επιφάνεια κοπής.'],['The guiding fingers stay curled back and the knife follows a controlled arc.','Τα δάχτυλα του χεριού-οδηγού μένουν λυγισμένα και το μαχαίρι κινείται με ελεγχόμενο τόξο.']],
    38:[['Roasted pieces have visibly browned edges.','Τα ψημένα κομμάτια έχουν ορατά ροδισμένες άκρες.'],['Most pieces retain their shape without heavy blackening.','Τα περισσότερα κομμάτια διατηρούν το σχήμα τους χωρίς έντονο μαύρισμα.']],
    59:[['The finished soup is visible in a bowl.','Η έτοιμη σούπα φαίνεται σε ένα μπολ.'],['Its texture looks smooth, without large unblended pieces.','Η υφή φαίνεται λεία, χωρίς μεγάλα κομμάτια που δεν έχουν πολτοποιηθεί.']],
    72:[['Show oil being added in small amounts while whisking.','Δείξτε το λάδι να προστίθεται λίγο-λίγο ενώ χτυπάτε με το σύρμα.'],['The dressing becomes combined rather than leaving a large separate oil layer.','Το ντρέσινγκ ενώνεται χωρίς να μένει ένα μεγάλο ξεχωριστό στρώμα λαδιού.']],
    87:[['The fillet and any removed pin bones are shown separately.','Το φιλέτο και όσα μικρά κόκαλα αφαιρέθηκαν φαίνονται χωριστά.'],['The fillet is intact and its surface is clearly visible.','Το φιλέτο παραμένει ακέραιο και η επιφάνειά του φαίνεται καθαρά.']],
    91:[['Raw poultry and ready-to-eat food have visibly separate preparation areas.','Το ωμό κοτόπουλο και τα έτοιμα προς κατανάλωση τρόφιμα έχουν εμφανώς χωριστούς χώρους προετοιμασίας.'],['Separate boards or tools are visible for the two areas.','Φαίνονται ξεχωριστές επιφάνειες κοπής ή εργαλεία για τους δύο χώρους.']],
    150:[['The finished dinner shows the main, a vegetable side and a sauce or finishing element.','Το έτοιμο δείπνο δείχνει το κυρίως, ένα συνοδευτικό λαχανικό και μια σάλτσα ή τελικό στοιχείο.'],['The components are recognizable and served together; restaurant presentation is not required.','Τα στοιχεία αναγνωρίζονται και σερβίρονται μαζί. Δεν απαιτείται επαγγελματική παρουσίαση.']]
  };
  window.COOKPATH_EVIDENCE_RULES = Object.fromEntries((window.COOKPATH_TASKS || []).map(t => {
    const kind = video.has(t.id) ? 'video' : photo.has(t.id) ? 'photo' : 'none';
    const checks = custom[t.id]?.map(pair => L(...pair)) || [
      L('Show the ingredient or result clearly, with the relevant parts in the frame.','Δείξτε καθαρά το υλικό ή το αποτέλεσμα, με τα σχετικά σημεία μέσα στο κάδρο.'),
      t.proof
    ];
    return [t.id,{kind,checks:kind === 'none' ? [] : checks}];
  }));
})();
