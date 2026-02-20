# DB Isolation levels demo
This is an exercise to show how transaction isolation levels works on PostgreSQL, using Prisma ORM.

This emulates part of a banking system, where a `transfer` action is implemented through a database transaction. Here, data is consider holding its integrity when after all operations, the sum of balance between all accounts is the same as in the beginning.

There are three tests, one for each isolation level (read committed, repeatable read and serializable), you can run them to see the behavior:

- **Read committed**: Inside a transaction, a `SELECT` query can see changes committed by other transactions. This would lead to the following phenomena: Nonrepeatable Reads, Phantom Reads and Serialization Anomalies.
- **Repeatable read**: Inside a transaction, queries only sees data committed before it started. When a repeatable read transaction tries to act over a row that is changed by a concurrent transaction, it will wait. If the concurrent transaction rolls back, then the repeatable read transaction will proceed, else, the repeatable read transaction will be rolled back with an error message. Possible phenomena in this level: Serialization Anomalies.
- **Serializable**: Same as repeatable read level but with additional checks that monitor for conditions which could result in inconsistent states.

*Docs about phenomena and how isolation levels are implemented  in postgreSQL [here](https://www.postgresql.org/docs/current/transaction-iso.html).*

## How to run

Install dependencies with:

``bun run install``

Then, start database with:

``docker compose -f compose.db.yml up``

Next, run migrations with:

``bunx prisma migrate deploy``

Now you are ready to go.

You can run tests with:

``bun run test``

To run a specific test, pass a regex pattern with `-t` option:

``bun run test -t SERIALIZABLE``

## Conclusions
Higher levels of transaction isolation provides, of course, better isolation when concurrent transactions occurs, however, they come with trade-offs, like additional resource requirements and possible blocking leading to having to retry transactions.
Choosing the right isolation level for a system will depends on what the business logic is, expected concurrency level, tolerance for retries and how critique would be each phenomena on the system.

For example:
- If it is a reporting system than can tolerate rare anomalies, repeatable read would be ok.
- If it is a shopping or baking system, where a serialization anomaly would lead to money creation or placing an order with zero stock, serialization level should be necessary.

Also, PostgreSQL provides lock modes, for cases where this isolation levels alone doesn't provide the desired behavior, described [here](https://www.postgresql.org/docs/current/explicit-locking.html).

## Collaboration
Feel free to add more cases, other databases or discuss anything!

I've made a video explaining how this works and why phenomena could be happening: https://youtu.be/MRmKFp3qPFw