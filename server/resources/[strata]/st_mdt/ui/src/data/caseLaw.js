// Case Law Types: 1 = Search & Seizure, 2 = Use of Force, 3 = Rights & Procedure
export const CaseLawTypes = [
	{ value: 1, label: 'Search & Seizure' },
	{ value: 2, label: 'Use of Force' },
	{ value: 3, label: 'Rights & Procedure' },
];

export const CaseLaw = [
	// ---------- Search & Seizure ----------
	{
		id: 1,
		type: 1,
		title: 'Terry v. Ohio (1968)',
		principle: 'Reasonable Suspicion – Stop & Frisk',
		holding:
			'Police may briefly stop and detain a person when there is reasonable, articulable suspicion of criminal activity. Officers may also conduct a limited pat-down for weapons when they reasonably believe the individual may be armed and dangerous.',
	},
	{
		id: 2,
		type: 1,
		title: 'Carroll v. United States (1925)',
		principle: 'Probable Cause – Vehicle Search',
		holding:
			'A warrantless search of a vehicle is constitutionally permissible when there is probable cause to believe the vehicle contains contraband or evidence of a crime. The inherent mobility of vehicles creates an exigent circumstance justifying the exception.',
	},
	{
		id: 3,
		type: 1,
		title: 'United States v. Ross (1982)',
		principle: 'Vehicle Search – Containers Included',
		holding:
			'When police have probable cause to search a lawfully stopped vehicle, they may search every part of the vehicle and any container found within it that could conceal the object of the search. No separate probable cause is required for each container.',
	},
	{
		id: 4,
		type: 1,
		title: 'Chimel v. California (1969)',
		principle: 'Search Incident to Arrest – Immediate Area',
		holding:
			'Upon a lawful arrest, police may search the arrestee\'s person and the area within their immediate control — the area from which they might reach a weapon or destroy evidence. Broader searches require a warrant.',
	},
	{
		id: 5,
		type: 1,
		title: 'Arizona v. Gant (2009)',
		principle: 'Vehicle Search Incident to Arrest – Limits',
		holding:
			'Police may only search a vehicle incident to arrest when the arrestee is unsecured and within reaching distance of the passenger compartment, or when it is reasonable to believe the vehicle contains evidence of the offense of arrest. Once the suspect is secured and cannot access the vehicle, a warrantless search incident to arrest is no longer justified.',
	},
	{
		id: 6,
		type: 1,
		title: 'Mapp v. Ohio (1961)',
		principle: 'Exclusionary Rule',
		holding:
			'Evidence obtained through a search or seizure that violates the Fourth Amendment is inadmissible in a criminal prosecution. This "exclusionary rule" applies to state and local law enforcement and serves as a deterrent against unconstitutional police conduct.',
	},
	{
		id: 7,
		type: 1,
		title: 'Katz v. United States (1967)',
		principle: 'Reasonable Expectation of Privacy',
		holding:
			'The Fourth Amendment protects people, not places. A search occurs when government agents violate a person\'s reasonable expectation of privacy. What a person knowingly exposes to the public is not subject to Fourth Amendment protection; what they seek to preserve as private, even in an area accessible to the public, may be.',
	},
	{
		id: 8,
		type: 1,
		title: 'Illinois v. Caballes (2005)',
		principle: 'Drug Dog During Lawful Traffic Stop',
		holding:
			'A dog sniff conducted during a lawful traffic stop does not violate the Fourth Amendment, provided the stop is not unreasonably prolonged. The use of a trained narcotics detection dog alongside the vehicle exterior is not a search.',
	},
	{
		id: 9,
		type: 1,
		title: 'Rodriguez v. United States (2015)',
		principle: 'Traffic Stop Duration – No Extension for Dog Sniff',
		holding:
			'A police stop may not be extended — even briefly — beyond the time reasonably required to complete the traffic stop\'s mission in order to allow a dog sniff. Once the purpose of the stop is complete, continued detention requires reasonable suspicion.',
	},
	{
		id: 10,
		type: 1,
		title: 'Riley v. California (2014)',
		principle: 'Cell Phone Search – Warrant Required',
		holding:
			'Police generally may not, without a warrant, search digital information on a cell phone seized from an individual who has been arrested. Cell phones are not the same as other containers found on an arrestee; their vast storage capacity requires heightened protection.',
	},
	// ---------- Use of Force ----------
	{
		id: 11,
		type: 2,
		title: 'Graham v. Connor (1989)',
		principle: 'Excessive Force – Objective Reasonableness',
		holding:
			'Claims of excessive force by law enforcement are analyzed under the Fourth Amendment\'s "objective reasonableness" standard. The reasonableness of a particular use of force must be judged from the perspective of a reasonable officer on the scene, not with hindsight. Factors include the severity of the crime, whether the suspect poses an immediate threat, and whether the suspect is actively resisting.',
	},
	{
		id: 12,
		type: 2,
		title: 'Tennessee v. Garner (1985)',
		principle: 'Deadly Force – Fleeing Felons',
		holding:
			'Use of deadly force to prevent the escape of a fleeing felon is unconstitutional unless the officer has probable cause to believe the suspect poses a significant threat of death or serious physical injury to the officer or others. An unarmed, non-dangerous suspect may not be shot simply to prevent escape.',
	},
	{
		id: 13,
		type: 2,
		title: 'Scott v. Harris (2007)',
		principle: 'Pursuit – Force to Terminate Chase',
		holding:
			'An officer\'s use of force to terminate a dangerous high-speed vehicle pursuit — even when it places the fleeing motorist at risk of serious injury or death — does not violate the Fourth Amendment where the suspect\'s driving posed a substantial and immediate risk of serious physical injury to others.',
	},
	{
		id: 14,
		type: 2,
		title: 'Plumhoff v. Rickard (2014)',
		principle: 'Deadly Force – Ending Dangerous Chase',
		holding:
			'Officers do not violate the Fourth Amendment by using deadly force to end a high-speed pursuit when the suspect\'s driving poses a continuing threat to the public. Officers are not required to stop shooting until the threat has been eliminated.',
	},
	// ---------- Rights & Procedure ----------
	{
		id: 15,
		type: 3,
		title: 'Miranda v. Arizona (1966)',
		principle: 'Custodial Interrogation – Miranda Warning',
		holding:
			'Prior to custodial interrogation, suspects must be informed of their rights: the right to remain silent, that anything said may be used against them in court, the right to an attorney, and that if they cannot afford an attorney one will be appointed. Statements made without a proper Miranda warning are inadmissible.',
	},
	{
		id: 16,
		type: 3,
		title: 'Pennsylvania v. Mimms (1977)',
		principle: 'Traffic Stop – Driver Exit Order',
		holding:
			'Once a vehicle has been lawfully stopped, an officer may order the driver to exit the vehicle as a matter of course without needing any additional justification. The intrusion on the driver\'s liberty is minimal compared to the officer\'s safety interest.',
	},
	{
		id: 17,
		type: 3,
		title: 'Maryland v. Wilson (1997)',
		principle: 'Traffic Stop – Passenger Exit Order',
		holding:
			'An officer making a lawful traffic stop may order any passenger to exit the vehicle without needing individualized reasonable suspicion. The officer safety rationale of Pennsylvania v. Mimms applies equally to passengers.',
	},
	{
		id: 18,
		type: 3,
		title: 'Illinois v. Gates (1983)',
		principle: 'Probable Cause – Totality of Circumstances',
		holding:
			'The existence of probable cause for a search warrant is determined by the "totality of the circumstances." Informant tips, even anonymous ones, may establish probable cause when considered alongside other corroborating facts and the informant\'s veracity, reliability, and basis of knowledge.',
	},
	{
		id: 19,
		type: 3,
		title: 'Berkemer v. McCarty (1984)',
		principle: 'Traffic Stop – Not Custodial for Miranda',
		holding:
			'An ordinary traffic stop is not a custodial arrest requiring Miranda warnings. A motorist detained briefly at a routine traffic stop is not "in custody" for Miranda purposes. However, if the officer decides to place the driver under formal arrest, Miranda warnings must be given before questioning.',
	},
	{
		id: 20,
		type: 3,
		title: 'Utah v. Strieff (2016)',
		principle: 'Attenuation Doctrine – Pre-existing Warrant',
		holding:
			'Evidence discovered during an unlawful stop may be admissible if the connection between the unconstitutional conduct and the discovery of evidence has been "attenuated." Where a valid pre-existing arrest warrant is discovered during an unlawful stop and the subsequent arrest is lawful, evidence found on the suspect may be admissible under the attenuation doctrine.',
	},
];
