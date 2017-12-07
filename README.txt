==========================================
======  Warehouse Management System ======
==========================================

Author 
	Mitchell Smith

Description
	Warehouse Management System.
		Node.js web server
		MongoDB database
		Handlebars templete processor 
		Bootstrap front-end framework

Application Pages
	Add Items, add items to the items database
	Assign VR, assign a skid to a location, given VR ID
	Create PO, create a purchase order (PO), return PO #
	Create VR, create a skid given PO # and SKU, return VR ID
	Find Skid, given VR ID, PO #, or SKU, return locations
	home, welcome page
	Put Away, display a list of skids that need to be put away
	Receive PO, Given a PO#, adjust the  received quantity of SKUs on the order
	Replen, Display a list of locations that need product replen, and the location of the replen

Web Server
	app.js, Node.js server

