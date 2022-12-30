import * as vscode from 'vscode';

export function activate( context: vscode.ExtensionContext ) {
   const sbItem = vscode.window.createStatusBarItem( vscode.StatusBarAlignment.Right, 1000 );
   sbItem.text    = "mk";
   sbItem.command = 'extension.mk.allTargets';
   sbItem.tooltip = 'Permet de lancer une cible du Makefile du projet courant.';
   context.subscriptions.push( sbItem );
   console.log( "activate|createStatusBarItem" );

   function makeTarget( dir: string, target: string ) {
      let term = vscode.window.activeTerminal;
      console.log( "makeTarget|term = " + term );
      if( term === undefined ) {
         term = vscode.window.createTerminal( dir );
         console.log( "makeTarget|after createTerminal, term = " + term );
      }
      if( term !== undefined ) {
         console.log( "makeTarget|term.show( false )" );
         term.show( false );
         term.sendText( "make " + target );
      }
   }
   
   const targets: string[] = [];

   function parseMakefile( context: vscode.ExtensionContext, path: string ) {
      require( 'fs' ).readFile( path, ( err: any, data: any ) => {
         if( err ) { throw err; }
         const dir   = require( 'path' ).dirname( path );
         const lines = data.toString().split( '\n' );
         for( let ndx in lines ) {
            let line = lines[ndx];
            let tokens: string[] = line.split( /\s+/ );
            if(( tokens.length > 1 )&&( tokens[0] === '.PHONY:' )) {
               sbItem.show();
               for( let ndxT = 1; ndxT < tokens.length; ++ndxT ) {
                  const target    = tokens[ndxT];
                  const commandID = 'extension.mk.' + target;
                  targets.push( target );
                  console.log( "parseMakefile|registerCommand '" + commandID + '"' );
                  context.subscriptions.push(
                     vscode.commands.registerCommand( commandID, () => makeTarget( dir, target )));
               }
            }
         }
      });
   }
   
   vscode.workspace
      .findFiles( '**/Makefile' )
      .then( v => v.forEach( value => parseMakefile( context, value.path )));

   context.subscriptions.push(
      vscode.commands.registerCommand(
         'extension.mk.allTargets',
         () => vscode.window
            .showQuickPick( targets, { canPickMany: false })
            .then( target => {
               if( target ) {
                  vscode.commands.executeCommand( 'extension.mk.' + target );
               }
            })
      )
   );
   console.log( "activate|registerCommand 'extension.mk.allTargets'" );
}

export function deactivate() {}
