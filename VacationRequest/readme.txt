/*
 * DWKit Vacation Request Sample
 * https://dwkit.com
 */
 
DWKit is a .NET BPM system made with simplicity and flexibility in mind. DWKit allows you to model, automate and execute mission-critical business processes, whatever industry you are operating in.
A ready-made BPM solution is often not enough to satisfy your business requirements. Be it the need to ensure regulatory compliance or to build custom logic that goes beyond what the system has to offer, we believe that making the source code open is the way to go.
Hence, we made DWKit's source code available to our customers so that they can alter whatever it is that will make their business more efficient.
 
Demo on-line: http://demo.dwkit.com
Please note. The sample was assembled with .NET Core. We recommend using Visual Studio 2017 or JetBrains Rider as IDE.

The sample supports MS SQL and PosgreSQL as storage.
1. You need to set up Database, restore backup OR (!!!) execute script.
1.1. Backup
1.1.1. MSSQL: DB\MSSQL\backup.bak
1.1.2. PostgreSQL: DB\PostgreSQL\backup.sql
1.2. The order of execution of scripts:
1.2.1. DWKitScript.sql
1.2.2. Workflow_CreatePersistenceObjects.sql
1.2.3. CreateObjects.sql
1.2.4. FillData.sql
2. Open VacationRequest.sln file via Visual Studio 2017 or JetBrains Rider
3. Check a connection string in OptimaJet.DWKit.StarterApplication\appsettings.json (You might use MS SQL, PosgreSQL or Oracle connection string's format)
4. If you are using Oracle, then uncomment the path to the metadata file for Oracle - metadata-oracle.json. We need this file, because the names of some tables  in Oracle differ from tables in other databases.
5. Run OptimaJet.DWKit.StarterApplication (Press F5 for Visial Studio).
6. The credential for admin user:
- Login: admin
- Password: 1
7. The Admin Panel URL is http://<url>/admin

More information about how to use DWKit look at the https://dwkit.com/documentation/.
