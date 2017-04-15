#######################
#       README        #
#    Server manual    #
#######################

1. URLs
```````

Google Drive :
 * Connection : http://
 * File getting : 
 * 

Dropbox :
 * Connection : 
 * File getting :
 *

OneDrive :
 * Connexion :
 * File getting :
 *

2. File merging + JSON generation :
```````````````````````````````````

--> See "generatedJSONExemple.json" for the generated JSON format.

ID generation : get the original id + add a suffix in case of duplicates
New id = (g-|d-|o-) + 'original id'

Exemple : a file with id "a43g318zgEg9rLFK2f" on both Google Drive and Dropbox would give : 
 - "g-a43g318zgEg9rLFK2f" for Google Drive 
 - "d-a43g318zgEg9rLFK2f" for Dropbox

 3. 