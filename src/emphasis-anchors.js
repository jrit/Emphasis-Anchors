/*  --------------------------------------------------

Emphasis
by Michael Donohoe (@donohoe)
https://github.com/NYTimes/Emphasis
http://open.blogs.nytimes.com/2011/01/10/emphasis-update-and-source/
    
- - - - - - - - - -

jQueryized by Rob Flaherty (@ravelrumba)
https://github.com/robflaherty/Emphasis

- - - - - - - - - -

Trimmed from the original NYT version to just support anchoring without highlighting
Substantial refactoring to take advantage of jQuery
https://github.com/jrit/Emphasis-Anchors

--------


Copyright (C) 2011 The New York Times (http://www.nytimes.com)
Copyright (C) 2014 Jarrett Widman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
    
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
    
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

-------------------------------------------------- */

( function ( $ )
{
	"use strict";

	var util = {
		
		/*
		 * Read and interpret the URL hash
		 */
		getHashKey: function ()
		{
			var hash = decodeURI( location.hash );
			var findp = hash.match( /(paragraph[^[\]]*)/ );
			var key = ( findp && findp.length > 0 ) ? findp[1] : null;
			return ( key );
		},

		/*
		 * From text, generate a Key
		 */
		createKey: function ( txt )
		{
			txt = txt.replace( /[^a-z\. ]+/gi, '' );

			var key = "";
			var len = 6;

			if ( txt && txt.length > 1 )
			{
				var lines = this.getSentences( txt );
				if ( lines.length > 0 )
				{
					var first = this.cleanArray( lines[0].replace( /[\s\s]+/gi, ' ' ).split( ' ' ) ).slice( 0, ( len / 2 ) );
					var last = this.cleanArray( lines[lines.length - 1].replace( /[\s\s]+/gi, ' ' ).split( ' ' ) ).slice( 0, ( len / 2 ) );
					var k = first.concat( last );

					var max = ( k.length > len ) ? len : k.length;
					for ( var i = 0; i < max; i++ )
					{
						key += k[i].substring( 0, 1 );
					}
				}
			}
			return ( key );
		},

		/*
		 * Break a Paragraph into Sentences, bearing in mind that the "." is not the definitive way to do so
		 */
		getSentences: function ( el )
		{
			var html = ( typeof el === "string" ) ? el : el.innerHTML,
				mrsList = "Mr,Ms,Mrs,Miss,Msr,Dr,Gov,Pres,Sen,Prof,Gen,Rep,St,Messrs,Col,Sr,Jf,Ph,Sgt,Mgr,Fr,Rev,No,Jr,Snr",
				topList = "A,B,C,D,E,F,G,H,I,J,K,L,M,m,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,etc,oz,cf,viz,sc,ca,Ave,St",
				geoList = "Calif,Mass,Penn,AK,AL,AR,AS,AZ,CA,CO,CT,DC,DE,FL,FM,GA,GU,HI,IA,ID,IL,IN,KS,KY,LA,MA,MD,ME,MH,MI,MN,MO,MP,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,PR,PW,RI,SC,SD,TN,TX,UT,VA,VI,VT,WA,WI,WV,WY,AE,AA,AP,NYC,GB,IRL,IE,UK,GB,FR",
				numList = "0,1,2,3,4,5,6,7,8,9",
				webList = "aero,asia,biz,cat,com,coop,edu,gov,info,int,jobs,mil,mobi,museum,name,net,org,pro,tel,travel,xxx",
				extList = "www",
				d = "__DOT__",

				list = ( topList + "," + geoList + "," + numList + "," + extList ).split( "," ),
				len = list.length,
				i, lines;

			for ( i = 0; i < len; i++ )
			{
				html = html.replace( new RegExp(( " " + list[i] + "\\." ), "g" ), ( " " + list[i] + d ) );
			}

			list = ( mrsList + "," + numList ).split( "," );
			len = list.length;
			for ( i = 0; i < len; i++ )
			{
				html = html.replace( new RegExp(( list[i] + "\\." ), "g" ), ( list[i] + d ) );
			}

			list = ( webList ).split( "," );
			len = list.length;
			for ( i = 0; i < len; i++ )
			{
				html = html.replace( new RegExp(( "\\." + list[i] ), "g" ), ( d + list[i] ) );
			}

			lines = this.cleanArray( html.split( '. ' ) );
			return lines;
		},

		/*  Get the Levenshtein distance - a measure of difference between two sequences */
		lev: function ( a, b )
		{
			var m = a.length,
				n = b.length,
				r = [],
				c, o, i, j;

			r[0] = [];

			if ( m < n ) { c = a; a = b; b = c; o = m; m = n; n = o; }
			for ( c = 0; c < n + 1; c++ ) { r[0][c] = c; }
			for ( i = 1; i < m + 1; i++ )
			{
				r[i] = [];
				r[i][0] = i;
				for ( j = 1; j < n + 1; j++ )
				{
					r[i][j] = this.smallest( r[i - 1][j] + 1, r[i][j - 1] + 1, r[i - 1][j - 1] + ( ( a.charAt( i - 1 ) === b.charAt( j - 1 ) ) ? 0 : 1 ) );
				}
			}
			return r[m][n];
		},

		/*  Return smallest of two values */
		smallest: function ( x, y, z )
		{
			if ( x < y && x < z ) { return x; }
			if ( y < x && y < z ) { return y; }
			return z;
		},

		/*  Remove empty items from an array */
		cleanArray: function ( a )
		{
			var n = [];
			for ( var i = 0; i < a.length; i++ )
			{
				if ( a[i] && a[i].replace( / /g, '' ).length > 0 )
				{
					n.push( a[i] );
				}
			}
			return n;
		}
	};

	$.fn.emphasisAnchors = function ( options )
	{
		/*
		 * Build a list of Paragrphs, keys, and add meta-data to each Paragraph with data attributes
		 */
		var paragraphList = function ()
		{
			var $existing = $( "[" + settings.dataKeyAttribute + "]" );
			if ( $existing.length )
			{
				return $existing;
			}

			createAllParagraphKeys();
			return $( "[" + settings.dataKeyAttribute + "]" );
		};

		/*
		 * Generate keys for all the paragraphs
		 */
		var createAllParagraphKeys = function ()
		{
			var created = 0;
			$paragraphs.each( function ()
			{
				var $p = $( this );
				if ( ( $p.text() || "" ).replace( / /g, "" ).length > 0 )
				{
					$p.attr( settings.dataKeyAttribute, createParagraphKey( $p ) ); // Unique Key
					$p.attr( settings.dataOrdinalAttribute, created ); // Order
					created++;
				}
			} );
		};
		
		/*
		 * From a Paragraph, generate a Key
		 */
		var createParagraphKey = function ( $p )
		{
			return ( "paragraph" + util.createKey( $p.text() || '' ) );
		};

		/*
		 * From a list of Keys, locate the Key and corresponding Paragraph
		 */
		var findKey = function ( key )
		{
			if ( !key )
			{
				return $();
			}

			var $pl = paragraphList();
			var ln = $pl.length;

			var $existing = $( "[" + settings.dataKeyAttribute + "='" + key + "']" );

			if ( $existing.length )
			{
				return ( $existing );
			}

			var nearKey = key.replace( /paragraph/, "" );

			$pl.each( function ()
			{
				var localKey = $( this ).attr( settings.dataKeyAttribute ).replace( /paragraph/, "" );

				var ls = util.lev( nearKey.slice( 0, 3 ), localKey.slice( 0, 3 ) );
				var le = util.lev( nearKey.slice( -3 ), localKey.slice( -3 ) );

				if ( ( ls + le ) < 3 )
				{
					$existing = $( this );
					return ( false );
				}
			} );

			return ( $existing );
		};

		/*  
			* Move view to top of a given Paragraph 
			*/
		var goAnchor = function ( $p )
		{
			if ( $p && $p.length )
			{
				setTimeout( function ()
				{
					var shiftDown = 80;
					$( window ).scrollTop( $p.offset().top - shiftDown );
					$p.addClass( settings.anchorTargetClass );

					if ( typeof ( settings.onMovedToAnchor ) === "function" )
					{
						settings.onMovedToAnchor();
					}

				}, 500 );
			}			
		};


		var settings = $.extend( {
			dataKeyAttribute: "data-emphasis-key",
			dataOrdinalAttribute: "data-emphasis-ord",
			anchorTargetClass: "emphasis-target",
			onMovedToAnchor: Function.prototype,
			onEmphasisDone: Function.prototype
		}, options );

		var $paragraphs = $( this );

		createAllParagraphKeys();
		goAnchor( findKey( util.getHashKey() ) );

		if ( typeof ( settings.onEmphasisDone ) === "function" )
		{
			settings.onEmphasisDone();
		}

		return ( this );
	};

} )( jQuery );