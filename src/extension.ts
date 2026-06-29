import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

declare const DEBUG: boolean;

export function debug(...args: unknown[]): void {
   if(DEBUG) {
      console.log(...args);
   }
}

export function activate(context: vscode.ExtensionContext) {
   const sbItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
   sbItem.text    = "mk";
   sbItem.command = 'extension.mk.allTargets';
   sbItem.tooltip = 'Permet de lancer une cible du Makefile du projet courant.';
   context.subscriptions.push( sbItem );
   debug( "activate|createStatusBarItem" );

   function makeTarget( dir: string, target: string ) {
      let term = vscode.window.activeTerminal;
      debug( "makeTarget|term = " + term );
      if( term === undefined ) {
         term = vscode.window.createTerminal( dir );
         debug( "makeTarget|after createTerminal, term = " + term );
      }
      if( term !== undefined ) {
         debug( "makeTarget|term.show( false )" );
         term.show( false );
         target = target.substring( dir.length + 1 );
         term.sendText( "(cd '" + dir + "' && make " + target + ")" );
      }
   }
   
   const targets: string[] = [];

   function parseMakefile(context: vscode.ExtensionContext, makefile_path: string) {
      debug("parseMakefile|" + makefile_path);
      fs.readFile(makefile_path, (err: NodeJS.ErrnoException|null, data: Buffer) => {
         if(err) {
            throw err;
         }
         const dir  : string   = path.dirname(makefile_path);
         const lines: string[] = data.toString().split( '\n' );
         let continuation = false;
         for(let ndx in lines) {
            let line = lines[ndx].trim();
            let tokens: string[] = line.split(/\s+/);
            if(( tokens.length === 1 )&&( tokens[0] === '.PHONY:\\' )) {
               continuation = true;
            }
            else if(( tokens.length > 0 )&&( continuation ||(tokens[0] === '.PHONY:'))) {
               sbItem.show();
               continuation = false;
               for( let ndxT = ( tokens[0] === '.PHONY:' ) ? 1 : 0; ndxT < tokens.length; ++ndxT ) {
                  let target = tokens[ndxT];
                  if( target.length === 0 ) {
                     continue;
                  }
                  if( target.endsWith( '\\' )) {
                     target = target.substring( 0, target.length - 1 );
                     continuation = true;
                  }
                  let prefix = dir;
                  if( vscode.workspace.workspaceFolders ) {
                     for( const ws of vscode.workspace.workspaceFolders ) {
                        const sw = dir.substring( 0, ws.uri.path.length );
                        if( sw === ws.uri.path ) {
                           prefix = ws.name + dir.substring( ws.uri.path.length );
                           break;
                        }
                     }
                  }
                  const commandID = 'extension.mk.' + prefix + "." + target;
                  targets.push( prefix + "." + target );
                  debug( "parseMakefile|registerCommand '" + commandID + '"' );
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
   debug( "activate|registerCommand 'extension.mk.allTargets'" );
}

export function deactivate() {;}
