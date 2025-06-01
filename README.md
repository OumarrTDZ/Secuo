# The development plan I make for each element of the database to don't get lost:

ACT

#### 0 Config (Server, DDBB, Middleware)  
#### 1 Models  
#### 2 Controllers  
#### 2.2 Extra utils  
#### 3 Routes  
#### 4 Frontend Pages/Components  
#### 5 Extra (App/Main/Styles)

---

## Spaces and Buildings

- Spaces do not have to be inside a building.  
- When creating a space, allow providing location data by selecting an existing building.  
- If the building does not exist yet, allow creating it on the spot to add the space inside.

---

## Pending Tasks - Users and Admins

- Advanced validations → Improve validation rules for email, password, DNI, etc., using express-validator.  
- Improved error handling → Clearer error messages and proper HTTP status codes.  
- Auditing and logs → Log important actions such as user updates and deletions.  
- Password recovery → Enable users to reset passwords via email with temporary tokens.  
- Expired token management → Detect and handle expired tokens to enforce re-login.  
- Display in navbar: welcome + full name of logged-in user.

---

### Other Pending Tasks

- Render updated photos correctly on update.  
- Use proper routing with `<Link>` for navigation; back navigation should apply to the whole app.  
- When owners edit contracts, send predefined messages.  
- Admin approval required for deleting contracts, users, and spaces; notify related users beforehand.  
- Owners can delete spaces without contracts freely; otherwise, admin approval required.  
- Tenant must accept invitation to be added to a property to gain access; can then review contracts and submit reports (e.g., price disputes).  
- Fix missing `getContracts` endpoint and unify route naming conventions.

---

## Data Models and Priorities

### 1 SPACE (Properties and Units)

- Defines available spaces (apartments, garages).  
- Contains key details: size, location, owner, status.  
- Essential for linking contracts and transactions.  
- Priority: next step, since others depend on this.

### 2 CONTRACT (Rentals and Sales)

- Records which user rents/buys which space and the relevant dates.  
- Defines monthly payments, deposits, associated documents.  
- Depends on SPACE, must be created after properties.

### 3 BUILDING (Location of Spaces)

- Links spaces with addresses and postal codes.  
- Enables filtering by city, address.  
- Can be developed alongside SPACE to map locations.

### 4 MESSAGE (User Communication)

- Records messages between tenants and owners.  
- Essential for communication and support.  
- Can be developed in parallel with CONTRACT (depends on users).

### 5 REPORT (Property Issues)

- Allows tenants to report issues in their spaces.  
- Records status (PENDING, RESOLVED).  
- Depends on SPACE and CONTRACT, implemented afterwards.

---

## Additional Features and Improvements

- Advanced filters → Search spaces by status (AVAILABLE, OCCUPIED), price, or type (APARTMENT, GARAGE).  
- Clearer building association → Relate `spaceId` better with `buildingId` or delete builds and add those attrs to space.  
- Stricter validations → Prevent errors like spaces without price or owner.  
- Image management → Expand gallery logic.  
- Additional endpoints → Fetch available spaces, filter by city, etc.  
- Profit percentage calculations based on owner count or custom percentages (e.g., 40-60%).

---

## Frontend Roadmap

1. User management → Registration, login, JWT authentication.  
2. Session management → Store user data with Context API or Redux.  
3. Profile and settings → Edit user info and profile photo.  
4. WebSocket connection → Real-time notifications on user connect.  
5. Private and group chat creation → Real-time interaction.  
6. Real-time messaging → Send, receive, delete, and react to messages.

---

## Extra Time Features

- AWS Cloud for all UPLOADS file instance of local file save  
- More space types: plots, parks, etc.  
- Property search engine.  
- Direct property purchase and acquisition.  
- Keep UI simple and clean.  
- Luis Gomez validation and Modesto in app data seeder.

---

## Frontend Project Structure

