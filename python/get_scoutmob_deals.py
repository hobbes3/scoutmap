####################################
# Created by Satoshi Kawasaki
####################################

import re
import argparse
import urllib2
import pprint
import sys
import time
import db_config # Stores MySQL credentials
import MySQLdb as mdb
import beautifulsoup.BeautifulSoup as BeautifulSoup

####################################
# Start of variable initialization
####################################
START_TIME = time.time()

URL = "http://scoutmob.com"

DB_HOST     = db_config.DB_HOST
DB_USER     = db_config.DB_USER
DB_PASSWORD = db_config.DB_PASSWORD
DB_DATABASE = db_config.DB_DATABASE

TABLE_DEAL_NAME = 'tb_deal'
TABLE_BIZ_NAME  = 'tb_business'
####################################
# End of variable initialization
####################################

parser = argparse.ArgumentParser( description = "Insert or update Scoutmob deals into the database." )

parser.add_argument( '-v', '--verbose', action = 'store_true', default = False    , help = "prints verbose output"                                                    )
parser.add_argument( '-d', '--debug'  , action = 'store_true', default = False    , help = "prints debug and verbose information"                                     )
parser.add_argument( '-u', '--update' , action = 'store_true', default = False    , help = "update rows before skipping (usually for the column 'claimed')"           )
parser.add_argument( '-s', '--skip'   , action = 'store_true', default = False    , help = "continue the program when a deal is found (skipped), otherwise exit"      )
parser.add_argument( '-l', '--limit'  ,            type = int, default = 1        , help = "limit by number of deals by the most recent (0 for all deals): default 1" )
parser.add_argument( '-c', '--city'   ,                        default = 'atlanta', help = "choose the city for the deals (must match Scoutmob URL): default atlanta" )

parser.add_argument( '-t', '--truncate', action = 'store_true', default = False, help = "truncate both the biz and deal tables, then exit" )

args = parser.parse_args()

if args.debug: args.verbose = True

def verbose_string( verbose_info, use_pprint = False ):
    if args.verbose:
        if use_pprint:
            pprint.pprint( verbose_info )
        else:
            print verbose_info

# Almost the same as the debug_string().
def debug_string( debug_info, use_pprint = False ):
    if args.debug:
        verbose_string( debug_info, use_pprint )

# Wrapper for cur.execute().
def execute_sql( cur, query, parameters = None ):
    try:
        cur.execute( query, parameters )
    except:
        print sys.exc_info()

    debug_string( "\nSQL query ="    )
    debug_string( cur._last_executed )

    count = int( cur.rowcount )
    row = cur.fetchall()

    debug_string( "\ncount =" )
    debug_string( count       )
    debug_string( "\nrow ="   )
    debug_string( row         )

    return count, row

con = None
try:
    con = mdb.connect( DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE )
except mdb.Error, e:
    print "Error %d: %s" % ( e.args[ 0 ], e.args[ 1 ] )
    sys.exit()

# Truncate tables with the -t option. Used for debugging.
if args.truncate:
    cur = con.cursor()

    verbose_string( "Temporary dropping the foreign key constraint..." )
    execute_sql( cur, "alter table " + TABLE_DEAL_NAME + " drop foreign key fk_business" )

    verbose_string( "Truncating business table..." )
    execute_sql( cur, "truncate table " + TABLE_BIZ_NAME  )

    verbose_string( "Truncating deal table..." )
    execute_sql( cur, "truncate table " + TABLE_DEAL_NAME )

    verbose_string( "Recreating the foreign key constraint..." )
    execute_sql( cur, "alter table " + TABLE_DEAL_NAME + " add constraint fk_business foreign key ( business ) references tb_business ( business ) on delete cascade" )

    debug_string( 'Done' )

    con.commit()

    cur.close()
    con.close()
    sys.exit()

####################################
# Begin website text retrieval.
####################################

scoutmob_url = URL + "/" + args.city + "/past_deals"

soup = BeautifulSoup.BeautifulSoup( urllib2.urlopen( scoutmob_url ) )

# The page was actually not found and the Scoutmob redirected to the homepage with the worldmap.
# Some city has a past deals page but there are actually no deals.
if soup.find( 'div', { 'class' : 'worldmap_container' } ) != None or \
   soup.find( 'div', { 'class' : 'past_deal' } ) == None:
    print "Error: Could not open: " + scoutmob_url + ". Possible invalid Scoutmob city."
    sys.exit()

# Some "fancy" string formatting for the banner.
title = soup.html.head.title.string
banner_length = len( title ) + 2
format_str = "{:=^" + str( banner_length ) + "}"

verbose_string( format_str.format( "" ) )
verbose_string( format_str.format( title ) )
verbose_string( format_str.format( "" ) )

# The real work starts here. Find all <div>'s with the class name "past_deal".
deals = soup.findAll( 'div', { 'class' : 'past_deal' }, limit = args.limit )

for i, deal in enumerate( deals, start = 1 ):
    # These key names are the same as the field (column) names in the tables.
    deal_info = {
        'deal'             : None,
        'url'              : None,
        'business'         : None,
        'expiration'       : None,
        'percent_discount' : None,
        'max_discount'     : None,
        'one_per'          : None,
        'claimed'          : None,
        'city'             : args.city,
        'fine_print'       : None
    }

    biz_info = {
        'business'     : None,
        'name'         : None,
        'neighborhood' : None,
        'address'      : None,
        'city'         : None,
        'state'        : None,
        'zip_code'     : None,
        'latitude'     : None,
        'longitude'    : None,
        'phone'        : None,
        'url'          : None,
        'yelp_url'     : None,
    }

    links = deal.findAll( 'a' )

    # The first link wraps an image. We want the second link.
    deal_info[ 'url' ] = links[ 1 ][ 'href' ]

    # From here on, I start to use the following one-letter variables:
    # "f" is finding a particular tag
    # "m" is finding the particular match via regex
    # "p" is storing the regex statement
    # "g" is the same as "f" but after "f" was already assigned

    # You can only get the claimed information from the past deals page (and not from the individual deals).
    f = deal.find( 'span', { 'class' : 'claimed' } )
    if f and f.string:
        m = re.search( '(\d?),?(\d+) Claimed', f.string )
        if m: deal_info[ 'claimed' ] = m.group( 1 ) + m.group( 2 ) # Ex: Convert '1,723' to '1723'.

    # Now open the individual deal page. A deal's URL looks like this: http://scoutmob.com/atlanta/deal/2048
    # deal_href is a relative URL path.
    deal_doc = BeautifulSoup.BeautifulSoup( urllib2.urlopen( URL + deal_info[ 'url' ] ) )

    f = deal_doc.find( 'div', { 'class' : 'title' } )
    m = re.search( '(\d+)%', f.string )
    if m: deal_info[ 'percent_discount' ] = m.group( 1 )

    f = deal_doc.find( 'div', { 'class' : 'expiration' } )
    if f and f.string:
        m = re.search( '(\d+)/(\d+)/(\d+)', f.string )
        if m:
            month = m.group( 1 )
            day   = m.group( 2 )
            year  = m.group( 3 )

            # Ex: Convert '04/12/2012' to '2012-04-12' for the date type in the database.
            deal_info[ 'expiration' ] = year + '-' + month + '-' + day

    f = deal_doc.find( 'div', { 'class' : 'fine_print' } )

    if f and f.string:
        deal_info[ 'fine_print' ] = f.string

        m = re.search( '\$(\d+)', f.string )
        if m: deal_info[ 'max_discount' ] = m.group( 1 )

        m = re.search( '1 per ([a-z]{1,})', f.string )
        if m: deal_info[ 'one_per' ] = m.group( 1 )

    f = deal_doc.find( 'div', { 'class' : 'address_info' } )

    if f:
        g = f.find( 'div', { 'class' : 'biz_name' } )
        if g and g.string: biz_info[ 'name' ] = g.string

        g = f.find( 'div', { 'class' : 'neighborhood' } )
        if g and g.string: biz_info[ 'neighborhood' ] = g.string.title() # Capitalize the first letter only.

        g = f.find( 'div', { 'class' : 'address' } )
        if g and g.string: biz_info[ 'address' ] = g.string

        g  = f.find( 'div', { 'class' : 'city_state' } )
        if g and g.string:
            # There is always a comma before the state.
            # The state is always abbreviated.
            m = re.search( '(.+), (\D{2}) (\d+)', g.string )
            if m:
                biz_info[ 'city'     ] = m.group( 1 )
                biz_info[ 'state'    ] = m.group( 2 )
                biz_info[ 'zip_code' ] = m.group( 3 )

        g = f.find( 'div', { 'class' : 'phone' } )
        if g and g.string:
            m = re.findall( '\d+', g.string )
            if m and len( m ) == 3: biz_info[ 'phone' ] = m[ 0 ] + m[ 1 ] + m[ 2 ]

        bizlinks = f.find( 'div', { 'class' : 'bizlinks' } )
        if bizlinks:
            bizlinks_a = bizlinks.findAll( 'a' )
            # First link is the website, the second is the map.
            if bizlinks_a and len( bizlinks_a ) == 2:
                g = bizlinks_a[ 0 ][ 'href' ]
                if g:
                    biz_info[ 'url' ] = g

                p = re.compile( '@(-?\d+\.\d+),(-?\d+\.\d+)' ) # Get the lat, long in the form of "33.45632,-88.343224". Note the optional minus sign.
                m = p.search( bizlinks_a[ 1 ][ 'href' ] )
                if m:
                    biz_info[ 'latitude'  ] = m.group( 1 )
                    biz_info[ 'longitude' ] = m.group( 2 )

    debug_string( "\ndeal_info =" )
    debug_string( deal_info, True )
    debug_string( "\nbiz_info ="  )
    debug_string( biz_info , True )

####################################
# Begin database transaction.
####################################

    verbose_string( "" )

    cur = con.cursor( mdb.cursors.DictCursor )

    # Check for existing business info.
    count, row = execute_sql( cur, "select business from " + TABLE_BIZ_NAME + """ where
                                    phone = %(phone)s and neighborhood = %(neighborhood)s or
                                    name  = %(name)s"""
                                    , biz_info )

    # The business exist and...
    if count:
        verbose_string( '{:03}'.format( i ) + ": Found business " + biz_info[ 'name' ] )

        biz_info[ 'business' ] = row[ 0 ][ 'business' ]

        # ...update.
        if args.update:
            verbose_string( '{:03}'.format( i ) + ": Update (-u) on: Updating business info..." )

            debug_string( '\nbiz_info =' )
            debug_string( biz_info, True )

            execute_sql( cur, "update " + TABLE_BIZ_NAME + """ set
                               name         = %(name)s,
                               neighborhood = %(neighborhood)s,
                               address      = %(address)s,
                               city         = %(city)s,
                               state        = %(state)s,
                               zip_code     = %(zip_code)s,
                               latitude     = %(latitude)s,
                               longitude    = %(longitude)s,
                               phone        = %(phone)s,
                               url          = %(url)s,
                               yelp_url     = %(yelp_url)s
                               where business = %(business)s"""
                              , biz_info )

        # Grab and store the existing business primary key.
        deal_info[ 'business' ] = biz_info[ 'business' ]
    # The business doesn't exist so add the new business.
    else:
        verbose_string( '{:03}'.format( i ) + ": Adding new business " + biz_info[ 'name' ] + "..." )

        execute_sql( cur, "insert into " + TABLE_BIZ_NAME + """ values (
                           NULL,
                           %(name)s,
                           %(neighborhood)s,
                           %(address)s,
                           %(city)s,
                           %(state)s,
                           %(zip_code)s,
                           %(latitude)s,
                           %(longitude)s,
                           %(phone)s,
                           %(url)s,
                           %(yelp_url)s,
                           NULL
                           )"""
                           , biz_info )

        # Grab and store the newly added business primary key.
        deal_info[ 'business' ] = int( cur.lastrowid )

    # Note at this point the business primary key was found by 2 methods:
    # 1) The primary key of the existing business.
    # 2) The primary key of the new business.

    # Check for existing deal info.
    count, row = execute_sql( cur, "select deal from " + TABLE_DEAL_NAME + " where url = %(url)s", deal_info )

    # The deal already exist and...
    if count:
        verbose_string( '{:03}'.format( i ) + ": Found deal " + deal_info[ 'url' ] )

        # ...update.
        if args.update:
            verbose_string( '{:03}'.format( i ) + ": Update (-u) on: Updating deal info..." )

            # Note that url and business columns don't update.
            execute_sql( cur, "update " + TABLE_DEAL_NAME + """ set
                               expiration       = %(expiration)s,
                               percent_discount = %(percent_discount)s,
                               max_discount     = %(max_discount)s,
                               one_per          = %(one_per)s,
                               claimed          = %(claimed)s,
                               city             = %(city)s,
                               fine_print       = %(fine_print)s
                               where url = %(url)s"""
                               , deal_info )

        # ...don't update (skip).
        if args.skip:
            verbose_string( '{:03}'.format( i ) + ": Skip (-s) on: Moving on..." )
        else:
            verbose_string( '{:03}'.format( i ) + ": Skip (-s) off: Stopping..." )
            con.commit()
            break

    # The deal doesn't exist, so add.
    else:
        debug_string( "deal_info[ 'business' ] = " + str( deal_info[ 'business' ] ) )

        verbose_string( '{:03}'.format( i ) + ": Adding new deal " + deal_info[ 'url' ] + "..." )

        execute_sql( cur, "insert into " + TABLE_DEAL_NAME + """ values (
                           NULL,
                           %(url)s,
                           %(business)s,
                           %(expiration)s,
                           %(percent_discount)s,
                           %(max_discount)s,
                           %(one_per)s,
                           %(claimed)s,
                           %(city)s,
                           %(fine_print)s,
                           NULL
                           )"""
                           , deal_info )

    cur.close()
    con.commit() # You need to commit for InnoDB engine tables.
# End - for i, deal in enumerate( deals )

if con: con.close()

total_time = time.time() - START_TIME

verbose_string( "" )
verbose_string( '{:<23}'.format( "Average time per deal: " ) + '{:1.6f}'.format( total_time / len( deals ) ) + " sec" )
verbose_string( '{:<23}'.format( "Total time: "            ) + '{:1.6f}'.format( total_time                ) + " sec" )
verbose_string( "Done" )
